from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword

def GenerateJsonFromQueryResult(records):
    i = 0
    products = {'data':[]}
    print('PRODUCTS LEN: ' + str(len(records)))

    while i < len(records):
        product_id = records[i][0]
        product_name = records[i][1]
        product_description = records[i][2]
        product_count = records[i][4]
        product_price = float(records[i][5])

        products['data'].append({
            'id' : product_id, 
            'name' : product_name, 
            'description': product_description, 
            'count' : product_count, 
            'price' : product_price
        })

        i+=1
    
    return products

@rpc_method
def GetProducts(offset, products_per_page):
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
        sql = 'select * from products order by id offset %s limit %s'
        cur.execute(sql, (offset, products_per_page,))
        records = cur.fetchall()

        response_data = GenerateJsonFromQueryResult(records)
        data_json = json.dumps(response_data)
    except Exception as e:
        print(e)
    
    if(connection):
        cur.close()
        connection.close()
    
    return data_json

@rpc_method
def AddProductToCart(product_id, selected_count, product_count):
    if selected_count < product_count:
        #Connect to database
        try:
            connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                        "' user='" + onlineShop_dbuser + 
                                        "' password='" + onlineShop_dbpassword + "'")

            connection.autocommit = True
            cur = connection.cursor()
        except Exception as e:
            print(e)
        
        #Add product to cart
        try:
            sql = 'insert into carts default values RETURNING id'
            cur.execute(sql,)
            cart_id = cur.fetchone()[0]
            connection.commit()

            sql = 'insert into carts_products (cart_id, product_id, count) values(%s, %s, %s)'
            cur.execute(sql, (cart_id, product_id, selected_count))
            connection.commit()

            response = {'status': 'OK', 'msg' : 'Successful'}
            response = json.dumps(response)
        except Exception as e:
            print(e)
            response = {'status': 'Fail', 'msg' : 'Unable to add product to cart'}
            response = json.dumps(response)
        
        if(connection):
            cur.close()
            connection.close()
    else: 
        response = {'status' : 'Fail', 'msg' : 'Select lesser count'}
    
    return response

@rpc_method
def RegisterUser(first_name, last_name, email_address, password):
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
        sql = 'insert into carts default values RETURNING id'
        cur.execute(sql,)
        cart_id = cur.fetchone()[0]
        connection.commit()

        sql = 'insert into users (first_name, last_name, email_address, password, cart_id) values(%s, %s, %s, %s, %s)'
        cur.execute(sql, (first_name, last_name, email_address, password, cart_id))
        connection.commit()

        response = {'status': 'OK', 'msg' : 'Successful'}
        response = json.dumps(response)
    except Exception as e:
        print(e)
        response = {'status': 'Fail', 'msg' : 'Unable to register user'}
        response = json.dumps(response)
    
    if(connection):
        cur.close()
        connection.close()
    
    print(response)
    return response