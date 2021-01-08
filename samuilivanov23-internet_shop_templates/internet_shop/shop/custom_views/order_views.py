from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.conf import media_root
import json, psycopg2, json
from .modules import database_operations, response_payload, cart_actions, payment

dbOperator = database_operations.DbOperations()
cartManager = cart_actions.Cart()
payment = payment.Payment()

def CheckoutOrder(request):
    #TODO add porducts to order
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
    connection.autocommit = False

    try:
        sql= '''select p.id, p.name, p.description, p.count, p.price, round((cp.count*p.price), 2), cp.count from products as p 
                join carts_products as cp on p.id=cp.product_id where p.is_deleted=false and cp.cart_id=%s 
                union select Null as col1, Null as col2, Null as col3, Null as col4, Null as col5, round(sum(cp.count * p.price), 2), Null as col7 from products as p 
                join carts_products as cp on p.id=cp.product_id where p.is_deleted=false and cp.cart_id=%s'''

        sign_in_customer = request.session['sign_in_customer'] 
        cur.execute(sql, (sign_in_customer['cart_id'], sign_in_customer['cart_id'],))
        records = cur.fetchall()
        total_price = float(records[len(records) - 1][5])
        print(total_price)
        is_successfull, order_id = cartManager.AddProductsIntoOrder(records, sign_in_customer['cart_id'], sign_in_customer['id'], total_price, cur)
        request.session['order_id'] = order_id

        if is_successfull:
            print('Products were successfully added to order')
            connection.commit()
        else:
            #TODO handle unpropper order creation
            pass

    except Exception as e:
        print('Internal server error')
        print(e)
    
    context = payment.GeneratePaymentRequestData(order_id, total_price, cur, connection)

    try:
        connection.close()
        cur.close()
    except Exception as e:
        print(e)
    
    print(context)
    context['sign_in_user'] = request.session['sign_in_customer']
    return render(request, 'shop/ProceedPayment.html', context)

def ProceedPayment(request):
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
    connection.autocommit = False
    
    context = payment.SetStatusSent(request.session['order_id'], cur, connection)
    return render(request, 'shop/Products.html', context)