import psycopg2
import hashlib

class DbOperations:
    def ConnectToDb(self, onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword):
        try:
            connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                        "' user='" + onlineShop_dbuser + 
                                        "' password='" + onlineShop_dbpassword + "'")

            connection.autocommit = True
            cur = connection.cursor()
        except Exception as e:
            print(e)
        
        return cur, connection
    
    def MakePasswordHash(self, password):
        hashed_password = hashlib.sha256(str.encode(password)).hexdigest()
        return hashed_password

    def AddTokenToVerification(self, user_id, token, cur, connection):
        try:
            sql = 'insert into verification (user_id, token) values(%s, %s)'
            cur.execute(sql, (user_id, token, ))
            connection.commit()
        except Exception as e:
            print(e)