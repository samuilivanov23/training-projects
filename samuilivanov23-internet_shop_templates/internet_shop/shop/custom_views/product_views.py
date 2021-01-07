from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
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
        sql = 'select id, name, description, count, price from products where is_deleted=false limit 10'
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

def CartProducts(request):
    cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)

    try:
        sign_in_user = request.session['sign_in_customer']

        try:
            sql= '''select p.id, p.name, p.description, p.count, p.price, round((p.count*p.price), 2) from products as p 
                    join carts_products as cp on p.id=cp.product_id where p.is_deleted=false and cp.cart_id=%s 
                    union select Null as col1, Null as col2, Null as col3, Null as col4, Null as col5, round(sum(p.count * p.price), 2) from products as p 
                    join carts_products as cp on p.id=cp.product_id where p.is_deleted=false and cp.cart_id=%s'''
            
            cur.execute(sql, (sign_in_user['cart_id'], sign_in_user['cart_id'],))
            products = cur.fetchall()
            cart = responsePayloadOperator.CartProductsJSON(products)
            
            context = {'cart' : cart, 'sign_in_user' : sign_in_user, 'media_root' : media_root} #TODO add form to chenge selected count for each product
            return render(request, 'shop/CartProducts.html', context)
        except Exception as e:
            print('Unable to fetch products')
            print(e)
            return HttpResponseRedirect('/shop/products/')

        try:
            connection.close()
            cur.close()
        except Exception as e:
            print(e)

    except Exception as e:
        print('User must log in first')
        print(e)