from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import loader
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.conf import salt
import json, psycopg2
from .modules import database_operations
from .modules import response_payload
from  .forms import LoginCustomerForm

dbOperator = database_operations.DbOperations()
responsePayloadOperator = response_payload.ResponsePayloadOperations()

def LoginCustomer(request):
    try:
        print(request.session)
    except Exception as e:
        print(e)
    
    if request.method == 'POST':
        form = LoginCustomerForm(request.POST)

        if form.is_valid():
            #proccess data TODO
            cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)

            hashed_password = dbOperator.MakePasswordHash(form.cleaned_data['password'] + salt)
            sql = 'select id, username, cart_id from users where email_address=%s and password=%s'
            print(form.cleaned_data['email_address'], hashed_password)
            cur.execute(sql, (form.cleaned_data['email_address'], hashed_password, ))
            user_record = cur.fetchone()
            print('user')
            print(user_record)

            try:
                connection.close()
                cur.close()
            except Exception as e:
                print(e)

            try:
                sign_in_customer = {
                    'customer_id' : user_record[0],
                    'customer_username' : user_record[1],
                    'customer_cart_id' : user_record[2]
                }
            except Exception as e:
                print(e)
                form = LoginCustomerForm()
                context = {'form' : form, 'msg' : 'Customer does not exist'}
                return render(request, 'shop/LoginCustomer.html', context)
            
            try:
                request.session['sign_in_customer'] = sign_in_customer
                return HttpResponseRedirect('/shop/products/')
            except Exception as e:
                print(e)
                form = LoginCustomerForm()
                context = {'form' : form, 'msg' : 'Unable to login'}
                return render(request, 'shop/LoginCustomer.html', context)
    else:
        form = LoginCustomerForm()
        context = {'form' : form}

    return render(request, 'shop/LoginCustomer.html', context)