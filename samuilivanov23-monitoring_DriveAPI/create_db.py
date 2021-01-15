import psycopg2
from conf import monitoring_dbname, monitoring_dbuser, monitoring_dbpassword
import threading

def CreateTables(cur, connection):    
    command = ('''
        CREATE TABLE IF NOT EXISTS cpu (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "user_load" numeric NOT NULL,
            "system" numeric NOT NULL,
            "iowait" numeric NOT NULL
        );

        CREATE TABLE IF NOT EXISTS hdd (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "label" text,
            "read_ps" numeric NOT NULL,
            "wrtn_ps" numeric NOT NULL

        );

        CREATE TABLE IF NOT EXISTS ssd (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "label" text,
            "read_ps" numeric NOT NULL,
            "wrtn_ps" numeric NOT NULL        
        );

        CREATE TABLE IF NOT EXISTS memory (
            "id" bigserial PRIMARY KEY,
            "measured_at" timestamp,
            "used_gb" numeric NOT NULL,
            "active_gb" numeric NOT NULL,
            "inactive_gb" numeric NOT NULL,
            "free_gb" numeric NOT NULL
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