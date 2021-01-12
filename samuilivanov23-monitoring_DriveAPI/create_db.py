import psycopg2
from dbconf import monitoring_dbname, monitoring_dbuser, monitoring_dbpassword
import threading

def CreateTables(cur, connection):    
    command = ('''
        CREATE TABLE IF NOT EXISTS cpu_temp (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "temperature" numeric NOT NULL
        );

        CREATE TABLE IF NOT EXISTS hdd_temp (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "label" text,
            "temperature" numeric NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ssd_temp (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "label" text,
            "temperature" numeric NOT NULL
        );
    ''')

    try:
        #create the tables in the database
        cur.execute(command)
        connection.commit()
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)


        
    
if __name__ == '__main__':
    #connect to the database
    connection = psycopg2.connect("dbname='" + monitoring_dbname + 
                                  "' user='" + monitoring_dbuser + 
                                  "' password='" + monitoring_dbpassword + "'")

    connection.autocommit = False
    cur = connection.cursor()

    CreateTables(cur, connection)

    try:
        cur.close()
        connection.close()
    except Exception as e:
        print(e)