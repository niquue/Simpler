import sqlite3


def connect():
    conn = sqlite3.connect('user.db')
    conn.row_factory = sqlite3.Row
    return conn

def resetDB():

    with connect() as db:
        #db.execute("DROP TABLE IF EXISTS UserInfo")
        db.execute("""
                   CREATE table IF NOT EXISTS UserInfo (
                     id INTEGER PRIMARY KEY,
                     username TEXT(50) NOT NULL,
                     password TEXT(255) NOT NULL
                   )
        """)

    with connect() as db:
        #db.execute("DROP TABLE IF EXISTS Category")
        db.execute("""
                   CREATE table IF NOT EXISTS Category (
                     id INTEGER PRIMARY KEY,
                     todo TEXT,
                     status INTEGER,
                     nid INTEGER,
                     FOREIGN KEY(nid) REFERENCES UserInfo(id)
                   )
        """)

    with connect() as db:
        #db.execute("DROP TABLE IF EXISTS Subcategory")
        db.execute("""
                CREATE table IF NOT EXISTS Subcategory (
                    id INTEGER PRIMARY KEY,
                    sub_todo TEXT,
                    completed INTEGER,
                    cid INTEGER,
                    FOREIGN KEY(cid) REFERENCES Category(id)
                    )
        """)



if __name__ == "__main__":
    print("Resetting database")
    resetDB()

        
