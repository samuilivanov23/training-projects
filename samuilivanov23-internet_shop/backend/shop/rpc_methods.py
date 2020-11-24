from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import traceback
import custom_modules.modules as modules

productsJSONServer = modules.ProductJSON()
dbOperator = modules.DbOperations()

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

        sql = 'select count(*) from products'
        cur.execute(sql,)
        product_records_count = cur.fetchone()[0] / products_per_page

        response = productsJSONServer.GetAllProductsJSON(records, product_records_count)
    except Exception as e:
        response = {'status' : 'Fail', 'msg' : 'Unable to get products', 'data':[], 'pages_count' : 0}
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

            sql = 'select name, description, price, image_name from products where id=%s'
            cur.execute(sql, (product_id, ))
            product_record = cur.fetchone()
            product_name = product_record[0]
            product_description = product_record[1]
            product_price = product_record[2]
            product_image_name = product_record[3]

            product_to_add_data = {
                'id' : product_id,
                'name' : product_name,
                'description' : product_description,
                'price' : product_price,
                'selected_count' : selected_count,
                'image_name' : product_image_name
            }

            response = {'status': 'OK', 'msg' : 'Successful', 'product_to_add' : product_to_add_data}
        except Exception as e:
            print(traceback.format_exc())
            response = {'status': 'Fail', 'msg' : 'Unable to add product to cart', 'product_to_add' : {}}
        
        if(connection):
            cur.close()
            connection.close()
    else:
        response = {'status' : 'Fail', 'msg' : 'Select lesser count', 'product_to_add' : {}}

    print(response)
    return response

@rpc_method
def RegisterUser(first_name, last_name, username, email_address, password):
    DEFAULT_AUTHENTICATION_STATE = False
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

        hashed_password = dbOperator.MakePasswordHash(password)
        sql = 'insert into users (first_name, last_name, username, email_address, password, authenticated, cart_id) values(%s, %s, %s, %s, %s, %s, %s)'
        cur.execute(sql, (first_name, last_name, username, email_address, hashed_password, DEFAULT_AUTHENTICATION_STATE, cart_id))
        connection.commit()

        response = {'status': 'OK', 'msg' : 'Successful'}
    except Exception as e:
        print(e)
        response = {'status': 'Fail', 'msg' : 'Unable to register user - exception'}
    
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
        'cart_id' : 0
    }

    init_cart_info = []

    try:
        hashed_password = dbOperator.MakePasswordHash(password)
        print(email_address, hashed_password)
        sql = 'select username, cart_id from users where email_address=%s and password=%s'
        cur.execute(sql, (email_address, hashed_password))

        user_record = cur.fetchone()

        if user_record:
            username = user_record[0]
            user_cart_id = user_record[1]

            sign_in_user = {
                'username' : username,
                'email_address' : email_address,
                'cart_id' : user_cart_id
            }

            sql ='''select cp.product_id, p.name, p.description, p.price, cp.count, p.count, p.image_name from carts_products as cp
                    join products as p on cp.product_id=p.id where cp.cart_id=%s'''

            cur.execute(sql, (user_cart_id, ))
            records = cur.fetchall()

            if len(records) > 0:
                cart_products_data = productsJSONServer.GetCartProductsJSON(records)
                response = {'status': 'OK', 'msg' : 'Successful', 'userInfo' : sign_in_user, 'cart_products' : cart_products_data}
            else:
                response = {'status': 'OK', 'msg' : 'Successful', 'userInfo' : sign_in_user, 'cart_products' : init_cart_info}
        else:
            response = {'status': 'Fail', 'msg' : 'User does not exist. Change Email/password.', 'userInfo' : init_user_info, 'cart_products' : init_cart_info}

    except Exception as e:
        print(e)
        response = {'status': 'Fail', 'msg' : 'Unable to login user - exception', 'userInfo' : init_user_info, 'cart_products' : init_cart_info}
    
    if(connection):
        cur.close()
        connection.close()
    
    print(response)
    return response


@rpc_method
def CreateOrder(cart_id, total_price):
    user_id = cart_id

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
        sql ='''select cp.product_id, p.name, p.description, p.price, cp.count, p.count, p.image_name from carts_products as cp
                    join products as p on cp.product_id=p.id where cp.cart_id=%s'''

        cur.execute(sql, (cart_id, ))
        records = cur.fetchall()

        response = dbOperator.AddProductsIntoOrder(records, cart_id, user_id, total_price, cur)
    except Exception as e:
        print(traceback.format_exc())
        init_order_info = {
            'user_id' : 0,
            'total_price' : 0,
            'products' : []
        }

        msg = 'Unable to execute code'
        response = {'status' : 'Fail', 'msg' : msg, 'order_data' : init_order_info}

    print(response)
    response = json.dumps(response)
    print(response)
    return response