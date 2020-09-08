import psycopg2
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword

def createTables():    
    command = ('''

    CREATE TABLE IF NOT EXISTS "Authors" (
        "id" int PRIMARY KEY,
        "name" varchar UNIQUE
    );

    CREATE TABLE IF NOT EXISTS "Books" (
        "id" int PRIMARY KEY,
        "name" varchar UNIQUE,
        "author_id" int,
        "words_count" int,
        "sentences_count" int
    );

    CREATE TABLE IF NOT EXISTS "Words" (
        "id" int PRIMARY KEY,
        "word" varchar UNIQUE
    );

    CREATE TABLE IF NOT EXISTS "Sentences" (
        "id" int PRIMARY KEY,
        "sentence" varchar,
        "words_count" int, 
        "book_id" int
    );

    CREATE TABLE IF NOT EXISTS "Books_Words" (
        "book_id" int,
        "word_id" int,
        PRIMARY KEY("book_id", "word_id")
    );

    ALTER TABLE "Books_Words" ADD FOREIGN KEY (book_id) REFERENCES "Books" (id);

    ALTER TABLE "Books_Words" ADD FOREIGN KEY (word_id) REFERENCES "Words" (id);

    ALTER TABLE "Books" ADD FOREIGN KEY (author_id) REFERENCES "Authors" (id);

    ALTER TABLE "Sentences" ADD FOREIGN KEY (book_id) REFERENCES "Books" (id);
    
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