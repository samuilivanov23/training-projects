from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword

def GetAllProductsJSON(records):
    i = 0
    products = {'status' : 'OK', 'msg' : 'Successful', 'data':[]}
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

# This method takes the records from the carts_products table for a specific car
# and returns a dictionary list with product_id as key and selected product count as value 
def GetCartProductsJSON(records):
    i = 0
    cart_products = []

    while i < len(records):
        cart_products.append({
            'id' : records[i][0],
            'name' : records[i][1],
            'description' : records[i][2],
            'price' : records[i][3],
            'selected_count' : records[i][4]
        })
        
        i+=1
    return cart_products

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

        response = GetAllProductsJSON(records) #this function returns the response
    except Exception as e:
        response = {'status' : 'Fail', 'msg' : 'Unable to get products', 'data':[]}
        print(e)
    
    if(connection):
        cur.close()
        connection.close()
    
    response = json.dumps(response)
    return response

@rpc_method
def AddProductToCart(product_id, selected_count, product_count, cart_id):
    if int(selected_count) < int(product_count):
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
            sql = 'insert into carts_products (cart_id, product_id, count) values(%s, %s, %s)'
            cur.execute(sql, (cart_id, product_id, selected_count))
            connection.commit()

            response = {'status': 'OK', 'msg' : 'Successful'}
        except Exception as e:
            print(e)
            response = {'status': 'Fail', 'msg' : 'Unable to add product to cart'}
        
        if(connection):
            cur.close()
            connection.close()
    else:
        response = {'status' : 'Fail', 'msg' : 'Select lesser count'}
    
    response = json.dumps(response)
    return response

@rpc_method
def RegisterUser(first_name, last_name, username, email_address, password):
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

        sql = 'insert into users (first_name, last_name, username, email_address, password, cart_id) values(%s, %s, %s, %s, %s, %s)'
        cur.execute(sql, (first_name, last_name, username, email_address, password, cart_id))
        connection.commit()

        response = {'status': 'OK', 'msg' : 'Successful'}
    except Exception as e:
        print(e)
        response = {'status': 'Fail', 'msg' : 'Unable to register user'}
    
    if(connection):
        cur.close()
        connection.close()
    
    response = json.dumps(response)
    print(response)
    return response


@rpc_method
def LoginUser(email_address, password):
    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)
    
    init_user_info = {
        'username' : 'init',
        'email_address' : 'init',
        'cart_id' : 0,
    };

    init_cart_info = {
        'cart_id' : 0,
        'cart_products_data' : [],
    }
    
    try:
        print(email_address, password)
        sql = 'select username, cart_id from users where email_address=%s and password=%s'
        cur.execute(sql, (email_address, password))

        user_record = cur.fetchone()
        username = user_record[0]

        if not username == '':
            user_cart_id = user_record[1]

            sign_in_user = {
                'username' : username,
                'email_address' : email_address,
                'cart_id' : user_cart_id
            }

            sql ='''select cp.product_id, p.name, p.description, p.price, cp.count from carts_products as cp 
                    join products as p on cp.product_id=p.id where cp.cart_id=%s'''

            cur.execute(sql, (user_cart_id, ))
            records = cur.fetchall()

            if len(records) > 0:
                cart_products_data = GetCartProductsJSON(records);
                response = {'status': 'OK', 'msg' : 'Successful', 'userInfo' : sign_in_user, 'cart_products' : cart_products_data}
            else:
                response = {'status': 'OK', 'msg' : 'Successful', 'userInfo' : sign_in_user, 'cart_products' : c}
        else:
            response = {'status': 'Fail', 'msg' : 'User does not exist', 'userInfo' : init_user_info, 'cart_products' : init_cart_info}

    except Exception as e:
        print(e)
        response = {'status': 'Fail', 'msg' : 'Unable to login user', 'userInfo' : init_user_info, 'cart_products' : init_cart_info}
    
    if(connection):
        cur.close()
        connection.close()
    
    print(response)
    #response = json.dumps(response)
    print(response)
    return response