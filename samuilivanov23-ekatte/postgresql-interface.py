import psycopg2
from dbconfig import dbname_, dbuser_, dbpassword_

#connect to the database
connection = psycopg2.connect("dbname='" + dbname_ + "' user='" + dbuser_ + "' password='" + dbpassword_ + "'")
connection.autocommit = True
cur = connection.cursor()

selishte = input("Enter name of selishte: ")

sql = 'select s.id, s.name as selishte_name, s.type, s.obstina_id, obst.name as obstina_name, obst.oblast_id, obl.name as oblast_name from public."selishta" as s inner join public."obstini" as obst on s.obstina_id=obst.id inner join public."oblasti" as obl on obst.oblast_id=obl.id  where s.name=%s'
cur.execute(sql, (selishte,))
records = cur.fetchall() 

#print(" id    name    type    obstina_id")
print("\n ")
for row in records:
    print("id = " + row[0])
    print("selishte_name = " + row[1])
    print("selishte_type  = " + row[2])
    print("obstina_id = " + row[3])
    print("obstina_name = " + row[4])
    print("oblast_id = " + row[5])
    print("oblast_name = " + row[6] + "\n")