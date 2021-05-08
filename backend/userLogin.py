import db
import json
from bottle import auth_basic, response, request, hook, route

class Login:

    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

    def update(self):
        '''Writes back instance values into database'''
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE UserInfo SET username = ?, password = ? WHERE id = ?",
                           (self.username, self.password))

            conn.commit()

    def updateFromJSON(self, login_data):
        '''Unpack JSON representation to update instance variables and then
           calls update to write back into database'''

        self.username = login_data['username']
        self.password = login_data['password']
        self.update()

    def delete(self):
        '''Deletes instance from database, any object representations of the
           instance are now invalid and shouldn't be used including this one'''
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM UserInfo WHERE id = ?", (self.id,))

    def jsonable(self):
        '''Returns a dict appropriate for creating JSON representation
           of the instance'''

        return {'id': self.id, 'username': self.username, 'password': self.password}

    @staticmethod
    def createFromJSON(login_data):
        '''Creates new instance object using dict created from JSON representation
           using create'''

        # Unpack the instance data from JSON
        # Should validate information here and throw exception
        # if something is not right.
        username = login_data['username']
        password = login_data['password']

        # Check username is filled, not blank
        if username and not username.isspace():
            pass
        else:
            response.status = 400
            raise Exception("Username cannot be blank or nothing but white space.")

        # Check password is filled, not blank
        if password and not password.isspace():
            pass
        else:
            response.status = 400
            raise Exception("Password cannot be blank or nothing but white space")

        # Check password length is acceptable (greater than 8 chars)
        if len(password) < 8:
            response.status = 400
            raise Exception("Password must be greater than 8 characters.")

        with db.connect() as conn:
            cursor = conn.cursor()
            test_user_exist = Login.getAllIDs()
            for id in test_user_exist:
                cursor.execute("SELECT username FROM UserInfo WHERE id=?", (id,))
                row = cursor.fetchone()
                if username.lower() == row['username'].lower():
                    response.status = 400
                    raise Exception("Username already exists, please use a different one.")
            cursor.execute("INSERT INTO UserInfo (username, password) VALUES (?, ?)",
                           (username, password))

            conn.commit()
        return Login.find(cursor.lastrowid)

    @staticmethod
    def find(id):
        '''If row with specified id exists, creates and returns corresponding ORM
           instance. Otherwise Exception raised.'''

        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM UserInfo WHERE id = ?", (id,))
            row = cursor.fetchone()

        if row is None:
            raise Exception(f'No such User with id: {id}')
        else:
            return Login(row['id'], row['username'], row['password'])

    @staticmethod
    def getUser(user):

        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM UserInfo WHERE username=?", (user,))
            row = cursor.fetchone()

        if row is None:
            raise Exception(f'No such user with username: {user}')
        else:
            return Login(row['id'], row['username'], row['password'])

    @staticmethod
    def check(credentials):
        username = credentials['username']
        password = credentials['password']
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM UserInfo WHERE username=?", (username, ))
            row = cursor.fetchone()
        if row is None:
            raise Exception("No user found")
        else:
            if row['password'] == password:
                return json.dumps(True)
            else:
                raise Exception("Invalid password")

    @staticmethod
    def getAllIDs():
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM UserInfo")
            all_ids = [row['id'] for row in cursor]
        return all_ids

    @staticmethod
    def setupBottleRoutes(app):
        '''
        @app.get('/login')
        def getLoginCredentials():
            login_info = Login.check(request.json)
            if login_info:
                return json.dumps(True)
                #return True
                #return f'User login successful'
            else:
                response.status = 404
                return json.dumps(False)
                #return False
                #return f'Username or password invalid'
        '''

        @app.get('/login')
        def getLoginIndex():
            login_index = Login.getAllIDs()
            response.content_type = 'application/json'
            return json.dumps(login_index)

        @app.get('/login/<id>')
        def getLogin(id):
            try:
                user_login = Login.getUser(id)
            except Exception:
                response.status = 404
                #response.headers['Access-Control-Allow-Origin'] = '*'
                return False
                # return f"User {id} not found"
            return user_login.jsonable()

        @app.route('/login/<id>', method=['OPTIONS', 'POST'])
        def verifyUser(id):
            try:
                login_info = Login.check(request.json)
            except Exception as e:
                response.status = 404
                return str(e)
            return login_info

        #@app.post('/login')
        @app.route('/login', method=['OPTIONS', 'POST'])
        def postLogin():
            try:
                login_info = Login.createFromJSON(request.json)
            except Exception as e:
                response.status = 400
                return {"message": str(e), "status": response.status_code}
            return login_info.jsonable()

        @app.put('/login/<id>')
        def updateLoginInfo(id):
            '''Implements instance updating'''

            try:
                user_login = Login.find(id)
            except Exception:
                response.status = 404
                return f"User: {id} to update not found"

            user_login.updateFromJSON(request.json)
            return user_login.jsonable()

        @app.delete('/login/<id>')
        def deleteUser(id):
            '''Implements instance deletion'''

            try:
                user_login = Login.find(id)
            except Exception:
                response.status = 404
                return f"User: {id} to delete does not exist"

            user_login.delete()

            response.content_type = 'application/json'
            return json.dumps(True)
