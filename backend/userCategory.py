import db
import json
from bottle import auth_basic, response, request, hook, route

class Category:

    def __init__(self, id, todo, status, nid):
        self.id = id
        self.todo = todo
        self.status = status
        self.nid = nid

    def update(self):
        '''Writes back instance values into database'''
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE Category SET todo = ?, status = ?, nid = ? WHERE id = ?",
                           (self.todo, 1 if self.status else 0, self.nid, self.id))

            conn.commit()


    def updateFromJSON(self, cat_data):
        '''Unpack JSON representation to update instance variables and then
           calls update to write back into database'''

        self.todo = cat_data['todo']
        self.status = cat_data['status']
        self.nid = cat_data['nid']
        self.update()

    def delete(self):
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM Subcategory WHERE cid=?", (self.id,))
            cursor.execute("DELETE FROM Category WHERE id=?", (self.id,))

    def jsonable(self):
        return {'id': self.id, 'todo': self.todo, 'status': self.status, 'nid': self.nid}

    @staticmethod
    def createFromJSON(info):
        todo = info['todo']
        status = info['status']
        nid = info['nid']

        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Category (todo, status, nid) VALUES (?, ?, ?)",
                           (todo, 1 if status else 0, nid))
            conn.commit()
        return Category.find(cursor.lastrowid)

    @staticmethod
    def find(id):
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Category WHERE id=?", (id,))
            row = cursor.fetchone()

        if row is None:
            raise Exception(f'No such category with id: {id}')
        else:
            return Category(row['id'], row['todo'], bool(row['status']), row['nid'])

    @staticmethod
    def getAllCategories(id):
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Category WHERE nid=?", (id, ))
            row = cursor.fetchall()

        if row is None:
            raise Exception(f'No tasks found for user')
        else:
            tasks = []
            for index, tuple in enumerate(row):
                tasks.append(Category.find(tuple[0]).jsonable())
            return {'tasks': tasks}

    @staticmethod
    def getAllIDs():
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Category")
            all_ids = [row['id'] for row in cursor]
        return all_ids

    @staticmethod
    def setupBottleRoutes(app):
        @app.get('/category')
        def getCategoryIndex():
            category_index = Category.getAllIDs()
            response.content_type = 'application/json'
            return json.dumps(category_index)

        @app.get('/category/<id>')
        def getCategory(id):
            try:
                category = Category.getAllCategories(id)
            except Exception:
                response.status = 404
                return f'Category {id} not found'
            return category

        @app.route('/category', method=['OPTIONS', 'POST'])
        def postCategory():
            try:
                category = Category.createFromJSON(request.json)
            except Exception as e:
                response.status = 400
                return {"message": str(e), "status": response.status_code}
            return category.jsonable()

        @app.route('/category/<id>', method=['DELETE', 'OPTIONS'])
        #@app.delete('/category/<id>')
        def deleteCategory(id):
            try:
                category = Category.find(id)
            except Exception:
                response.status = 404
                return f'Category {id} to delete does not exist'
            category.delete()
            response.content_type = 'application/json'
            return json.dumps(True)

