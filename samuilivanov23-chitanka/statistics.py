import os
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword
import psycopg2

files = folders = 0

for _, dirnames, filenames in os.walk("../books"):
    files += len(filenames)
    folders += len(dirnames)

print("Number of books: " + str(files))
print("Number of authors: " + str(folders))