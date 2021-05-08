import bottle
from bottle import Bottle, run, response, request, hook, route
import json
import db
from userLogin import Login
from userCategory import Category
from userSubCategory import Subcategory
import os


app = Bottle()




# from "ron rothman" @ https://stackoverflow.com/questions/17262170/bottle-py-enabling-cors-for-jquery-ajax-requests
class EnableCors(object):
    name = 'enable_cors'
    api = 2
    def apply(self, fn, context):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            #response.headers['Access-Control-Allow-Origin'] = '*'   # I've heard you're supposed to change this if you put this on an actual server
            response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, SessionToken'

            if bottle.request.method != 'OPTIONS':
                # actual request; reply with the actual response
                return fn(*args, **kwargs)

        return _enable_cors

Login.setupBottleRoutes(app)
Category.setupBottleRoutes(app)
Subcategory.setupBottleRoutes(app)

app.install(EnableCors())

'''
@app.hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
'''




# Start the backend
if os.environ.get('APP_LOCATION') == 'heroku':
    run(app, host="0.0.0.0", port=int((os.environ.get("PORT", 5000))))
else:
    run(app, host='localhost', port=1080, debug=True)
