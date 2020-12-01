from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword, salt
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
        hashed_password = dbOperator.MakePasswordHash(password+salt)

        sql = 'select id, email_address, role_id from employees where email_address=%s and password=%s'
        cur.execute(sql, (email_address, hashed_password, ))
        employee_record = cur.fetchone()

        if not employee_record is None:
            employee_id = employee_record[0]
            email_address = employee_record[1]
            role_id = employee_record[2]

            sql = 'select p.create_perm, p.update_perm, p.delete_perm from roles as r left join permissions as p on r.permission_id=p.id where r.id=%s'
            cur.execute(sql, (role_id, ))
            permissions = cur.fetchone()
            
            sign_in_employee = {
                'id' : employee_id,
                'email_address' : email_address,
                'permissions' : {
                    'create' : permissions[0],
                    'update' : permissions[1],
                    'delete' : permissions[2],
                }, 
            }

            response = {'status' : 'OK', 'msg' : 'Successful', 'employeeInfo' : sign_in_employee}
        else:
            init_employee_info = {
                'id' : 0,
                'email_address' : 'init',
                'permissions' : {}, 
            }

            response = {'status' : 'Fail', 'msg' : 'Incorrect email/password', 'employeeInfo' : init_employee_info}
            if connection:
                    cur.close()
                    connection.close()
            
            #response = json.dumps(response)
            print(response)
            return response
    except Exception as e:
        init_employee_info = {
            'id' : 0,
            'email_address' : 'init',
            'permissions' : {}, 
        }

        response = {'status' : 'Fail', 'msg' : 'Unable to get products', 'employeeInfo' : init_employee_info}
        print(e)
    
    if connection:
        cur.close()
        connection.close()
    
    print(response)
    return response