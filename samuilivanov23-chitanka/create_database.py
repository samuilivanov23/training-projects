import psycopg2
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword

def createTables():    
    command = ('''

    CREATE TABLE IF NOT EXISTS authors (
        "id" serial PRIMARY KEY,
        "name" varchar UNIQUE,
        "words_count" int
    );

    CREATE TABLE IF NOT EXISTS books (
        "id" serial PRIMARY KEY,
        "name" varchar,
        "words_count" int,
        "author_id" int
    );

    CREATE TABLE IF NOT EXISTS words (
        "id" serial PRIMARY KEY,
        "word" varchar UNIQUE
    );

    CREATE TABLE IF NOT EXISTS sentences (
        "id" serial PRIMARY KEY,
        "sentence" varchar,
        "words_count" int,
        "book_id" int
    );

    CREATE TABLE IF NOT EXISTS books_words (
        "book_id" int,
        "word_id" int,
        PRIMARY KEY("book_id", "word_id")
    );

    ALTER TABLE books_words ADD FOREIGN KEY (book_id) REFERENCES books (id);

    ALTER TABLE books_words ADD FOREIGN KEY (word_id) REFERENCES words (id);

    ALTER TABLE books ADD FOREIGN KEY (author_id) REFERENCES authors (id);

    ALTER TABLE sentences ADD FOREIGN KEY (book_id) REFERENCES books (id);
    
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