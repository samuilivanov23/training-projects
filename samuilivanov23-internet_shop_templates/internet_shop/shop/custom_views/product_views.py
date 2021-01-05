from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import loader
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import json, psycopg2
from .modules import database_operations
from .modules import response_payload

dbOperator = database_operations.DbOperations()
responsePayloadOperator = response_payload.ResponsePayloadOperations()

def Products(request):
    try:
        print(request.session['sign_in_customer'])
    except Exception as e:
        print(e)

    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
    
    try:
        sql = 'select id, name, description, count, price from products where is_deleted=false limit 3'
        cur.execute(sql, )
        products = cur.fetchall()
        products = responsePayloadOperator.ProductsJSON(products)
        #products = ProductsJSON(products);

        context = {'products' : products}
        return render(request, 'shop/Products.html', context)
    except Exception as e:
        print(e)

    
    try:
        connection.close()
        cur.close()
    except Exception as e:
        print(e)

def ProductDetails(request, product_id, *args):
    try:
        print(request.session)
    except Exception as e:
        print(e)
    
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)

    try:
        sql ='''select p.id, p.name, p.description, p.count, p.price, m.name from products as p 
                join manufacturers as m on p.manufacturer_id=m.id where p.is_deleted=false and p.id=%s'''
        cur.execute(sql, (product_id, ))
        product = cur.fetchone()

        product = responsePayloadOperator.ProductDetailsJSON(product)
        #product = ProductDetailsJSON(product)
        
        context = {'product' : product}
        return render(request, 'shop/ProductDetails.html', context)
    except Exception as e:
        print(e)
        raise Http404("Product info not fetched")

    try:
        connection.close()
        cur.close()
    except Exception as e:
        print(e)