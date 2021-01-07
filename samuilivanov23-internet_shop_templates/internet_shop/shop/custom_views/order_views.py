from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.conf import media_root
import json, psycopg2, json
from .modules import database_operations, response_payload, cart_actions

dbOperator = database_operations.DbOperations()
cartManager = cart_actions.Cart()

def CheckoutOrder(request):
    #TODO add porducts to order
    print('HERE')
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
    connection.autocommit = False

    try:
        sql= '''select p.id, p.name, p.description, p.count, p.price, round((p.count*p.price), 2), cp.count from products as p 
                            join carts_products as cp on p.id=cp.product_id where p.is_deleted=false and cp.cart_id=%s 
                            union select Null as col1, Null as col2, Null as col3, Null as col4, Null as col5, round(sum(p.count * p.price), 2), Null as col7 from products as p 
                            join carts_products as cp on p.id=cp.product_id where p.is_deleted=false and cp.cart_id=%s'''

        sign_in_customer = request.session['sign_in_customer'] 
        cur.execute(sql, (sign_in_customer['cart_id'], sign_in_customer['cart_id'],))
        records = cur.fetchall()
        total_price = records[len(records) - 1][5]
        is_successfull = cartManager.AddProductsIntoOrder(records, sign_in_customer['cart_id'], sign_in_customer['id'], total_price, cur)

        print(is_successfull)

        if is_successfull:
            print('HERE?>?>?>?')
            connection.commit()
        else:
            #TODO handle unpropper order creation
            pass

    except Exception as e:
        print('Internal server error')
        print(e)
    
    try:
        connection.close()
        cur.close()
    except Exception as e:
        print(e)

    return HttpResponseRedirect('/shop/products/')
    #redirect to payment confirmation page