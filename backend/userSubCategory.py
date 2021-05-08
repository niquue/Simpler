import db
import json
from bottle import auth_basic, response, request, hook, route

class Subcategory:

    def __init__(self, id, sub_todo, completed, cid):
        self.id = id
        self.sub_todo = sub_todo
        self.completed = completed
        self.cid = cid

    def update(self):
        '''Writes back instance values into database'''
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE Subcategory SET sub_todo = ?, completed = ?, cid = ? WHERE id = ?",
                           (self.sub_todo, 1 if self.completed else 0, self.cid, self.id))

            conn.commit()


    def updateFromJSON(self, cat_data):
        '''Unpack JSON representation to update instance variables and then
           calls update to write back into database'''

        self.sub_todo = cat_data['sub_todo']
        self.completed = cat_data['completed']
        self.cid = cat_data['cid']
        self.update()

    def delete(self):
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM Subcategory WHERE id=?", (self.id,))

    def jsonable(self):
        return {'id': self.id, 'sub_todo': self.sub_todo, 'completed': self.completed, 'cid': self.cid}

    @staticmethod
    def createFromJSON(info):
        sub_todo = info['sub_todo']
        completed = info['completed']
        cid = info['cid']

        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Subcategory (sub_todo, completed, cid) VALUES (?, ?, ?)",
                           (sub_todo, 1 if completed else 0, cid))
            conn.commit()
        return Subcategory.find(cursor.lastrowid)

    @staticmethod
    def find(id):
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Subcategory WHERE id=?", (id,))
            row = cursor.fetchone()

        if row is None:
            print("hello find")
            raise Exception(f'No such category with id: {id}')
        else:
            return Subcategory(row['id'], row['sub_todo'], bool(row['completed']), row['cid'])

    @staticmethod
    def getallSubCategories(id):
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Subcategory WHERE cid=?", (id, ))
            row = cursor.fetchall()

        if row is None:
            raise Exception(f'No sub tasks found for user')
        else:
            sub_tasks = []
            for index, tuple in enumerate(row):
                sub_tasks.append(Subcategory.find(tuple[0]).jsonable())
            return {'sub_tasks': sub_tasks}


    @staticmethod
    def getAllIDs():
        with db.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Subcategory")
            all_ids = [row['id'] for row in cursor]
        return all_ids

    @staticmethod
    def setupBottleRoutes(app):
        @app.get('/sub_category')
        def getSubCategoryIndex():
            sub_category_index = Subcategory.getAllIDs()
            response.content_type = 'application/json'
            return json.dumps(sub_category_index)

        @app.get('/sub_category/<id>')
        def getSubCategory(id):
            try:
                sub_category = Subcategory.getallSubCategories(id)
            except Exception:
                response.status = 404
                return f'SubCategory {id} not found'
            return sub_category

        @app.route('/sub_category', method=['OPTIONS', 'POST'])
        def postCategory():
            try:
                sub_category = Subcategory.createFromJSON(request.json)
            except Exception as e:
                response.status = 400
                return {"message": str(e), "status": response.status_code}
            return sub_category.jsonable()

        #@app.delete('/sub_category/<id>')
        @app.route('/sub_category/<id>', method=['DELETE', 'OPTIONS'])
        def deleteCategory(id):
            try:
                sub_category = Subcategory.find(id)
            except Exception:
                response.status = 404
                return f'Category {id} to delete does not exist'
            sub_category.delete()
            response.content_type = 'application/json'
            return json.dumps(True)