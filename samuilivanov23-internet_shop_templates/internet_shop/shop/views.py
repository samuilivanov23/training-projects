from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.template import loader
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import json, psycopg2

def ProductsJSON(records): 
    products = []

    i = 0
    while i < len(records):

        products.append({
            'id' : records[i][0],
            'name' : records[i][1],
            'description': records[i][2],
            'count' : records[i][3],
            'price' : float(records[i][4]),
        })

        i+=1
    
    return products

def ProductDetailsJSON(record): 
    product = {
        'id' : record[0],
        'name' : record[1],
        'description': record[2],
        'count' : record[3],
        'price' : float(record[4]),
        'manufacturer_name' : record[5]
    }
    
    return product

def ConnectToDatabase():
    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)
    
    return cur, connection

# Create your views here.
def index(request):
    return render(request, 'shop/index.html')


def Products(request):
    # #Connect to database
    # try:
    #     connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
    #                                 "' user='" + onlineShop_dbuser + 
    #                                 "' password='" + onlineShop_dbpassword + "'")

    #     connection.autocommit = True
    #     cur = connection.cursor()
    # except Exception as e:
    #     print(e)

    cur, connection = ConnectToDatabase()

    try:
        sql = 'select id, name, description, count, price from products where is_deleted=false limit 3'
        cur.execute(sql, )
        products = cur.fetchall()
        products = ProductsJSON(products);

        print(products)

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
    cur, connection = ConnectToDatabase()
    print(product_id)

    try:
        sql ='''select p.id, p.name, p.description, p.count, p.price, m.name from products as p 
                join manufacturers as m on p.manufacturer_id=m.id where p.is_deleted=false and p.id=%s'''
        cur.execute(sql, (product_id, ))
        product = cur.fetchone()
        product = ProductDetailsJSON(product)
        
        print(product)

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