from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword, salt
import traceback
import custom_modules.modules as modules

dbOperator = modules.DbOperations()
employeesCRUD = modules.EmployeesCRUD()

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

            sql = 'select p.create_perm, p.read_perm, p.update_perm, p.delete_perm from roles as r left join permissions as p on r.permission_id=p.id where r.id=%s'
            cur.execute(sql, (role_id, ))
            permissions = cur.fetchone()
            
            sign_in_employee = {
                'id' : employee_id,
                'email_address' : email_address,
                'permissions' : {
                    'create_perm' : permissions[0],
                    'read_perm' : permissions[1],
                    'update_perm' : permissions[2],
                    'delete_perm' : permissions[3],
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


@rpc_method
def GetEmployees():
    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)
    
    response = employeesCRUD.ReadEmployees(cur)

    if connection:
        cur.close()
        connection.close()

    print(response)
    return response

@rpc_method
def CreateEmployee(first_name, last_name, email_address, password, role_name, permissions):
    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)
    
    try:
        response = employeesCRUD.Create(first_name, 
                                        last_name, 
                                        email_address, 
                                        password,
                                        salt, 
                                        role_name, 
                                        permissions, cur)
    except Exception as e:
        print(e)
        response = {'status' : 'Fail', 'msg' : 'Internal server error'}

    if connection:
        cur.close()
        connection.close()

    print(response)
    response = json.dumps(response)
    return response


@rpc_method
def UpdateEmployee(id, first_name, last_name, email_address, password, role_name, permissions):
    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)


    # get role_id and permission_id

    try:
        sql ='''select r.id, p.id from employees as e 
                join roles as r on e.role_id=r.id 
                join permissions as p on r.permission_id=p.id where e.id=%s'''
        cur.execute(sql, (id, ))
        result = cur.fetchone()
        role_id = result[0]
        permission_id = result[1]
        print(role_id, permission_id)
    except Exception as e:
        print(e)
        response = {'status' : 'Fail', 'msg' : 'Unable to get role_id/permissions_id'}

    try:
        response = employeesCRUD.Update(id,
                                        first_name, 
                                        last_name, 
                                        email_address, 
                                        password,
                                        salt,
                                        role_id,
                                        role_name,
                                        permission_id,
                                        permissions, 
                                        cur)
    except Exception as e:
        print(e)
        response = {'status' : 'Fail', 'msg' : 'Internal server error'}

    if connection:
        cur.close()
        connection.close()

    print(response)
    response = json.dumps(response)
    return response