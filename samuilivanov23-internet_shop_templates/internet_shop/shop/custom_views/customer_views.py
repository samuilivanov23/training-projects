from django.shortcuts import render
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import loader
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.conf import salt, sender_email, sender_password, server_email, server_port
import json, psycopg2
from datetime import datetime, timedelta
from .modules import database_operations, response_payload, email_verification
from  .forms import LoginCustomerForm, RegisterCustomerForm

dbOperator = database_operations.DbOperations()
responsePayloadOperator = response_payload.ResponsePayloadOperations()

def LoginCustomer(request):
    if request.method == 'POST':
        form = LoginCustomerForm(request.POST)

        if form.is_valid():
            #proccess data TODO
            cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
            hashed_password = dbOperator.MakePasswordHash(form.cleaned_data['password'] + salt)
            sql = 'select id, username, cart_id from users where email_address=%s and password=%s'
            cur.execute(sql, (form.cleaned_data['email_address'], hashed_password, ))
            user_record = cur.fetchone()
            print(user_record)

            try:
                connection.close()
                cur.close()
            except Exception as e:
                print(e)

            try:
                sign_in_customer = {
                    'id' : user_record[0],
                    'username' : user_record[1],
                    'cart_id' : user_record[2]
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

def LogoutCustomer(request):
    try:
        del request.session['sign_in_customer']
        return HttpResponseRedirect('/shop/products/')
    except Exception as e:
        print(e)
        return HttpResponseRedirect('/shop/products/')

def RegisterCustomer(request):
    if request.method == 'POST':
        form = RegisterCustomerForm(request.POST)
        if form.is_valid():
            cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)
            connection.autocommit = False

            try:
                sql = 'insert into carts default values RETURNING id'
                cur.execute(sql,)
                cart_id = cur.fetchone()[0]
                connection.commit()

                salted_password = dbOperator.MakePasswordHash(form.cleaned_data['password']+salt)
                sql = 'insert into users (first_name, last_name, username, email_address, password, cart_id) values(%s, %s, %s, %s, %s, %s) RETURNING id'
                cur.execute(sql, (form.cleaned_data['first_name'], 
                                  form.cleaned_data['last_name'], 
                                  form.cleaned_data['username'], 
                                  form.cleaned_data['email_address'], 
                                  salted_password, 
                                  cart_id))
                user_id = cur.fetchone()[0]
                connection.commit()
            except Exception as e:
                print('Unable to insert user')
                print(e)
                user_id = 0
            
            if user_id:
                print('BEFORE SendEMAIL')
                verifier = email_verification.Verifier()
                is_successful, token = verifier.SendEmail(user_id,
                                                form.cleaned_data['first_name'],
                                                form.cleaned_data['email_address'],
                                                cur,
                                                connection,
                                                sender_email,
                                                sender_password,
                                                server_email,
                                                server_port)
                
                request.session['token'] = token
                
                try:
                    connection.close()
                    cur.close()
                except Exception as e:
                    print(e)

                form = RegisterCustomerForm()
                if is_successful:
                    context = {'form' : form, 'email_vefification_status' : 'Email sent successfully'}
                else:
                    context = {'form' : form, 'email_vefification_status' : 'Unable to sent verification email'}

                return render(request, 'shop/RegisterCustomer.html', context)

            else:
                try:
                    connection.close()
                    cur.close()
                except Exception as e:
                    print(e)

                form = RegisterCustomerForm()
                context = {'form' : form, 'email_vefification_status' : 'Mail not sent due to user insertion error'}
                print('Mail not sent due to user insertion error')
                return render(request, 'shop/RegisterCustomer.html', context)

    else:
        form = RegisterCustomerForm()
        context = {'form' : form}
    
    return render(request, 'shop/RegisterCustomer.html', context)

def ConfirmEmail(request, token_id):
    try:
        print(token_id)
        print(type(token_id))
        print(request.session['token'])
        print(type(request.session['token']))
        if str(request.session['token']) == str(token_id):
            cur, connection = dbOperator.ConnectToDb(onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword)

            try:
                sql = 'select user_id, send_date from verification where token=%s'
                cur.execute(sql, (str(token_id), ))
                result = cur.fetchone()
                user_id = result[0]
                send_date = result[1]
                now = datetime.now()

                if (send_date + timedelta(hours=1)) < now:
                    form = RegisterCustomerForm()
                    context = {'form' : form, 'email_vefification_status' : 'Verification link has expired'}
                    print('Verification link has expired')
                else:
                    try:
                        sql = 'update users set authenticated=%s where id=%s'
                        cur.execute(sql, (True, user_id, ))

                        form = RegisterCustomerForm()
                        context = {'form' : form, 'email_vefification_status' : 'Virification successfull'}
                        print('Virification successfull')
                    except Exception as e:
                        print(e)
                        form = RegisterCustomerForm()
                        context = {'form' : form, 'email_vefification_status' : 'Unable to update user status to verified'}
                        print('Unable to update user status to verified')
            except Exception as e:
                print(e)
                form = RegisterCustomerForm()
                context = {'form' : form, 'email_vefification_status' : 'Unable go get send date'}
                print('Unable go get send date')

            try:
                connection.close()
                cur.close()
            except Exception as e:
                print(e)
            
            del request.session['token']
            return render(request, 'shop/RegisterCustomer.html', context)
        else:
            print('Tokens does not match')
            form = RegisterCustomerForm()
            context = {'form' : form, 'email_vefification_status' : 'Tokens does not match'}
            del request.session['token']
    except Exception as e:
        print(e)
        print('Session token not set')
        form = RegisterCustomerForm()
        context = {'form' : form, 'email_vefification_status' : 'Session token not set'}
    
    return render(request, 'shop/RegisterCustomer.html', context)