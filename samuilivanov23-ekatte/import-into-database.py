import psycopg2
import csv
from dbconfig import dbname_, dbuser_, dbpassword_

def createTables():
    "create tables in the PostgreSQL database"
    
    command = ('''

    CREATE TABLE IF NOT EXISTS "oblasti" (
        "id" varchar PRIMARY KEY,
        "name" varchar
    );

    CREATE TABLE IF NOT EXISTS "obstini" (
        "id" varchar PRIMARY KEY,
        "name" varchar,
        "oblast_id" varchar
    );

    CREATE TABLE IF NOT EXISTS "selishta" (
        "id" varchar PRIMARY KEY,
        "name" varchar,
        "type" varchar,
        "obstina_id" varchar
    );

    ALTER TABLE "obstini" ADD FOREIGN KEY (oblast_id) REFERENCES "oblasti" (id);

    ALTER TABLE "selishta" ADD FOREIGN KEY (obstina_id) REFERENCES "obstini" (id);
    
    ''')

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

def importData():
    try:
        file_path_oblasti = "/home/samuil2001ivanov/Downloads/Oblasti.csv"
        file_path_obstini = "/home/samuil2001ivanov/Downloads/Obstini.csv"
        file_path_selishta = "/home/samuil2001ivanov/Downloads/Selishta.csv"

        #load data into 'Oblasti' table
        loadFileIntoDb(file_path_oblasti, "oblasti")

        #load data into 'Obstini' table
        loadFileIntoDb(file_path_obstini, "obstini")

        #load data into 'Selishta' table
        loadFileIntoDb(file_path_selishta, "selishta")
    except psycopg2.Error as e:
        print(e)
    
    cur.close()
    connection.close()

def getCountRecordsInTables():
    #get the number of records in the 'oblasti' table
    count_sql_query = 'select count(*) from public."oblasti"'
    getRecordsCount(count_sql_query, "oblasti")

    #get the number of records in the 'obstini' table
    count_sql_query = 'select count(*) from public."obstini"'
    getRecordsCount(count_sql_query, "obstini")

    #get the number of records in the 'selishta' table
    count_sql_query = 'select count(*) from public."selishta"'
    getRecordsCount(count_sql_query, "selishta")

    cur.close()
    connection.close()

def getRecordsCount(sql_query, table_name):
    cur.execute(sql_query)
    records_count = cur.fetchone()[0]
    print('count of records in table "' + table_name + '": ' + str(records_count))

def loadFileIntoDb(file_path, table_name):
    with open(file_path, 'r') as f:
        reader = csv.reader(f)
        next(reader)
        row_count = sum(1 for row in reader)
        if row_count <= 1:
            for row in reader:
                cur.execute(
                    'insert into public."' + table_name + '" (id, name) values (%s, %s)',
                    row
                )
        
        connection.commit()    

if __name__ == '__main__':
    #connect to the database
    connection = psycopg2.connect("dbname='" + dbname_ + "' user='" + dbuser_ + "' password='" + dbpassword_ + "'")
    connection.autocommit = True
    cur = connection.cursor()

    createTables()
    importData()
    getCountRecordsInTables()