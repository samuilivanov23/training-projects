import psycopg2
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword

def createTables():    
    command = ('''

    CREATE TABLE IF NOT EXISTS "Authors" (
        "id" bigserial PRIMARY KEY UNIQUE,
        "name" varchar UNIQUE
    );

    CREATE TABLE IF NOT EXISTS "Books" (
        "id" bigserial PRIMARY KEY UNIQUE,
        "name" varchar UNIQUE,
        "author_id" bigserial
    );

    CREATE TABLE IF NOT EXISTS "Words" (
        "id" bigserial PRIMARY KEY UNIQUE,
        "word" varchar UNIQUE
    );

    CREATE TABLE IF NOT EXISTS "Books_Words" (
        "book_id" bigserial,
        "word_id" bigserial,
        PRIMARY KEY("book_id", "word_id")
    );

    ALTER TABLE "Books_Words" ADD FOREIGN KEY (book_id) REFERENCES "Books" (id);

    ALTER TABLE "Books_Words" ADD FOREIGN KEY (word_id) REFERENCES "Words" (id);

    ALTER TABLE "Books" ADD FOREIGN KEY (author_id) REFERENCES "Authors" (id);
    
    ''')

    #connect to the database
    connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                  "' user='" + chitanka_dbuser + 
                                  "' password='" + chitanka_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    connection = None
    try:
        #create the tables in the database
        cur.execute(command)
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if connection is not None:
            connection.close()

if __name__ == '__main__':
    createTables()