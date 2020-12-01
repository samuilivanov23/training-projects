from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import traceback
import custom_modules.modules as modules

dbOperator = modules.DbOperations()

@rpc_method
def LoginEmployee(email_address, password):
    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)
    
    #Fetch products from database
    try:
        try:
            sql = 'select salt from users where email_address=%s'
            cur.execute(sql, (email_address, ))
            salt = cur.fetchone()[0]
        except Exception as e:
            init_employee_info = {
                'id' : 0,
                'email_address' : 'init',
                'role_id' : 0,
            }

            response = {'status': 'Fail', 'msg' : 'Incorrect email.', 'employeeInfo' : init_employee_info}
            response = json.dumps(response)
            print(response)

            if(connection):
                cur.close()
                connection.close()
                
            return response

        hashed_password = dbOperator.MakePasswordHash(password+salt)
        
        sql = 'select id, email_address, role_id from employees where email_address=%s and password=%s'
        cur.execute(sql, (email_address, hashed_password, ))
        employee_record = cur.fetchone()

        employee_id = employee_record[0]
        email_address = employee_record[1]
        role_id = employee_record[2]
        
        sign_in_employee = {
            'id' : employee_id,
            'email_address' : email_address,
            'role_id' : role_id, 
        }
        
        response = {'status' : 'OK', 'msg' : 'Successful', 'employeeInfo' : sign_in_employee}
    except Exception as e:
        init_employee_info = {
            'id' : 0,
            'email_address' : 'init',
            'role_id' : 0, 
        }

        response = {'status' : 'Fail', 'msg' : 'Unable to get products', 'employeeInfo' : init_employee_info}
        print(e)
    
    if(connection):
        cur.close()
        connection.close()
    
    response = json.dumps(response)
    return response