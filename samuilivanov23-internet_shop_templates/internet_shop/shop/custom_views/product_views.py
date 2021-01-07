from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import loader
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.conf import media_root
import json, psycopg2, json
from .modules import database_operations, response_payload, cart_actions
from .forms import SelectProductQuantity

dbOperator = database_operations.DbOperations()
responsePayloadOperator = response_payload.ResponsePayloadOperations()
cartManager = cart_actions.Cart()

def Products(request):
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
    
    try:
        sql = 'select id, name, description, count, price from products where is_deleted=false limit 3'
        cur.execute(sql, )
        products = cur.fetchall()
        products = responsePayloadOperator.ProductsJSON(products)

        try:
            sign_in_user = request.session['sign_in_customer']
            user = json.dumps(sign_in_user);
            context = {'products' : products, 'sign_in_user' : sign_in_user, 'user' : user, 'media_root' : media_root}
        except Exception as e:
            print(e)
            context = {'products' : products, 'media_root' : media_root}
        return render(request, 'shop/Products.html', context)
    except Exception as e:
        print(e)

    try:
        connection.close()
        cur.close()
    except Exception as e:
        print(e)

def ProductDetails(request, product_id, *args):
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)

    if request.method == 'POST':
        try:
            sql = 'select cart_id from users where id=%s union select count from products where id=%s'
            cur.execute(sql, (request.session['sign_in_customer']['id'], product_id, ))
            result = cur.fetchall()
            cart_id = result[0][0]
            product_count = result[1][0]
        except Exception as e:
            print(e)
            cart_id = -1
            product_count = -1
            selected_count = -1

        selected_count = int(request.POST['quantity'])
        cartManager.AddProductToCard(product_id, selected_count, product_count, cart_id, cur)

        try:
            connection.close()
            cur.close()
        except Exception as e:
            print(e)
          
        return HttpResponseRedirect('/shop/products/')
    else:
        try:
            sql ='''select p.id, p.name, p.description, p.count, p.price, m.name from products as p 
                    join manufacturers as m on p.manufacturer_id=m.id where p.is_deleted=false and p.id=%s'''
            cur.execute(sql, (product_id, ))
            product = cur.fetchone()

            try:
                connection.close()
                cur.close()
            except Exception as e:
                print(e)

            product = responsePayloadOperator.ProductDetailsJSON(product)
            
            try:
                sign_in_user = request.session['sign_in_customer']
                user = json.dumps(sign_in_user);
                form = SelectProductQuantity(product['count'])
                context = {'form' : form, 'product' : product, 'sign_in_user' : sign_in_user, 'user' : user, 'media_root' : media_root}
            except Exception as e:
                print(e)
                form = SelectProductQuantity(product['count'])
                context = {'form' : form, 'product' : product, 'media_root' : media_root}

            return render(request, 'shop/ProductDetails.html', context)
        except Exception as e:
            print(e)
            raise Http404("Product info not fetched")