import hashlib
from PIL import Image
import random, string, json, math
import uuid, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import traceback
import re
import hmac, base64

class JSONParser:
    def __init__(self):
        pass

    def GetAllProductsJSON(self, records, pages_count): 
        response = {'status' : 'OK', 'msg' : 'Successful', 'data': [], 'pages_count' : pages_count}

        i = 0
        while i < len(records):
            product_id = records[i][0]
            product_name = records[i][1]
            product_description = records[i][2]
            product_count = records[i][4]
            product_price = float(records[i][5])
            image_name = records[i][6]

            response['data'].append({
                'id' : product_id,
                'name' : product_name,
                'description': product_description,
                'count' : product_count,
                'price' : product_price,
                'image' : image_name
            })

            i+=1
        
        return response

    # This method takes the records from the carts_products table for a specific car
    # and returns a dictionary list with product_id as key and selected product count as value 
    def GetCartProductsJSON(self, records):
        i = 0
        cart_products = []

        while i < len(records):
            cart_products.append({
                'id' : records[i][0],
                'name' : records[i][1],
                'description' : records[i][2],
                'price' : float(records[i][3]),
                'selected_count' : records[i][4],
                'count' : records[i][5],
                'image' : records[i][6]
            })
            
            i+=1

        return cart_products

    def GetAllEmployeesJSON(self, records):
        i = 0
        employees = []

        while i < len(records):
            employees.append({
                'id' : records[i][0],
                'first_name' : records[i][1],
                'last_name' : records[i][2],
                'email_address' : records[i][3],
                'role_name' : records[i][4],
                'permissions' : {
                    'create_perm' : records[i][5],
                    'read_perm' : records[i][6],
                    'update_perm' : records[i][7],
                    'delete_perm' : records[i][8],
                },
            })

            i+=1

        return employees

    def GetAllProductsBackofficeJSON(self, records):
        i = 0
        products = []

        while i < len(records):
            products.append({
                'id' : records[i][0],
                'name' : records[i][1],
                'description' : records[i][2],
                'manufacturer_name' : records[i][3],
                'manufacturer_id' : records[i][4],
                'count' : records[i][5],
                'price' : float(records[i][6]),
                'image' : records[i][7],
            })

            i+=1
        
        return products
    
    def GetAllManufacturersJSON(self, records):
        i = 0
        manufacturers = []

        while i < len(records):
            manufacturers.append({
                'id' : records[i][0],
                'name' : records[i][1],
            })

            i+=1
        
        return manufacturers
    
    def GetAllUsersJSON(self, records):
        i = 0
        users = []

        while i < len(records):
            users.append({
                'id' : records[i][0],
                'first_name' : records[i][1],
                'last_name' : records[i][2],
            })

            i+=1
        
        return users

    def GetAllOrdersJSON(self, records):
        i = 0
        orders = []

        while i < len(records):
            orders.append({
                'id' : records[i][0],
                'order_date' : str(records[i][1])[:-7], #-7 to skip the '.' + microseconds part of the date
                'user_first_name' : records[i][2],
                'user_last_name' : records[i][3],
                'total_price' : float(records[i][4]),
                'payment_date' : str(records[i][5]),
                'payment_status' : records[i][6],
            })

            i+=1
        
        return orders

class DbOperations:
    def __init__(self):
        pass

    def MakePasswordHash(self, password):
        hashed_password = hashlib.sha256(str.encode(password)).hexdigest()
        return hashed_password

    def CheckPasswordHash(self, password, hashed_password):
        if password == hashed_password:
            return True
        else:
            return False
    
    def GenerateSalt(self):
        chars = string.printable[:95] #get list of all ascii chars excluding special ones
        salt_length = 6
        salt = ''.join(random.choice(chars) for i in range(salt_length))
        
        return salt
    
    def GenerateImages(self, count, sizeX, sizeY):
        color = '#34a1eb' #skyblue
        image_names = []
        
        for i in range(count):
            img = Image.new("RGB", (sizeX, sizeY), color)
            folder_location = '/media/samuil2001ivanov/808137c8-9dff-4126-82f4-006ab928a3fc1/django_projects/internet_shop/frontend/internet_shop/public/images/'
            image_name = 'image' + str(i) + '.png'
            file_location = folder_location + image_name
            img.save(file_location, 'PNG')
            image_names.append(image_name)
        
        return image_names
    
    def GenerateRandomNames(self, count):
        import random, string
        names = []

        for _ in range(count):
            letters = string.ascii_lowercase
            name_length = random.randint(5, 10)
            name = ''.join(random.choice(letters) for i in range(name_length))
            names.append(name)
        
        return names

    def GenerateRandomDescriptions(self, count):
        descriptions = []
    
        for _ in range(count):
            letters = string.ascii_lowercase + ' '
            description_length = random.randint(30, 40)
            description = ''.join(random.choice(letters) for i in range(description_length))
            descriptions.append(description)
        
        return descriptions
    
    def UpdateProductsCounts(self, cart_products, cart_id, cur):
        for i in range(len(cart_products)):
            product_id = cart_products[i][0]
            count_after_checkout = cart_products[i][5] - cart_products[i][4] #count_in_stock - selected_count

            try:
                sql = 'update products set count=%s where id=%s'
                cur.execute(sql, (count_after_checkout, product_id))

                sql = 'delete from carts_products where cart_id=%s'
                cur.execute(sql, (cart_id,))
            except Exception as e:
                print(e)
    
    def CheckProductInStock(self, selected_count, count_in_stock):
        if selected_count <= count_in_stock:
            print('TRUE')
            return True
        else:
            print('FALSE')
            return False

    def AddProductsIntoOrder(self, cart_products, cart_id, user_id, total_price, cur):
        sql = 'insert into orders (date, total_price, user_id) values(current_timestamp(6), %s, %s) RETURNING id'
        cur.execute(sql, (total_price, user_id))
        order_id = cur.fetchone()[0]

        order_info = {
            'id' : order_id,
            'user_id' : user_id,
            'total_price' : total_price,
            'products' : []
        }

        response = {'status' : 'OK', 'msg' : 'Successfull', 'order_data' : order_info}

        for i in range(len(cart_products)):
            product_id = cart_products[i][0]
            selected_count = cart_products[i][4]
            count_in_stock = cart_products[i][5]

            if(self.CheckProductInStock(selected_count, count_in_stock)):
                try:
                    sql = 'insert into orders_products (order_id, product_id, count) values(%s, %s, %s)'
                    cur.execute(sql, (order_id, product_id, selected_count))
                    
                    response['order_data']['products'].append({
                        'id' : cart_products[i][0],
                        'name' : cart_products[i][1],
                        'description' : cart_products[i][2],
                        'price' : float(cart_products[i][3]),
                        'selected_count' : cart_products[i][4],
                        'count' : cart_products[i][5],
                        'image' : cart_products[i][6]
                    })

                except Exception as e:
                    print(e)
            else:
                try:
                    sql = 'delete from orders_products where order_id=%s'
                    cur.execute(sql, (order_id, ))
                    
                    sql = 'delete from orders where id=%s'
                    cur.execute(sql, (order_id, ))
                except Exception as e:
                    print(e)
                
                init_order_info = {
                    'id' : 0,
                    'user_id' : 0,
                    'total_price' : 0,
                    'products' : []
                }

                product_name = cart_products[i][1]
                if count_in_stock == 0:
                    msg = 'Product ' + product_name + ' is out of stock'
                else:
                    msg = 'Select less than ' + str(count_in_stock) + ' count from: ' + product_name + ' product'

                response = {'status' : 'Fail', 'msg' : msg, 'order_data' : init_order_info}
                return response
        
        self.UpdateProductsCounts(cart_products, cart_id, cur)

        return response

    def DeleteUser(self, user_id, cur):
        try:
            sql = 'delete from users where id=%s'
            cur.execute(sql, (user_id, ))
        except Exception as e:
            print(e)

    def AddTokenToVerification(self, user_id, token, cur):
        try:
            sql = 'insert into verification (user_id, token, send_date) values(%s, %s, current_timestamp(6))'
            cur.execute(sql, (user_id, token, ))
        except Exception as e:
            print(e)


class Verifier:
    def __init__(self):
        pass
    
    def SendEmail(self, user_id, 
                        first_name, 
                        receiver_email, 
                        cur, 
                        sender_email, 
                        sender_password, 
                        server_email, 
                        server_port):

        message = MIMEMultipart()
        message['Subject'] = 'Verification mail'
        message['From'] = sender_email
        message['To'] = receiver_email

        token = str(uuid.uuid4())
        dbOperator = DbOperations()
        dbOperator.AddTokenToVerification(user_id, token, cur)

        email_content = """\
        <html>
            <body>
                <p>Hi, """ + first_name + """. <br>
                If you registered in our shop with this email<br>
                <a href="http://localhost:3000/shop/confirm/""" + token + """">Please click here to verify.</a>
                </p>
            </body>
        </html>
        """

        try:
            message.attach(MIMEText(email_content, 'html'))
        except:
            print(traceback.format_exc())

        try:
            #Create secure connection with the server and send the email
            context = ssl.create_default_context()
        except:
            print(traceback.format_exc())

        try:
            with smtplib.SMTP_SSL(server_email, server_port, context=context) as server:
                server.login(sender_email, sender_password)
                server.sendmail(
                    sender_email, receiver_email, message.as_string()
                )

            response = {'status' : 'Success', 'msg' : 'Email send successfully', 'token' : token}
        except:
            print(traceback.format_exc())
            response = {'status' : 'Fail', 'msg' : 'Unable to send mail to user'}
        
        return response

class FiltersParser:
    def __init__(self):
        pass

    def ParseSortFilter(self, filter):
        filter_request = filter.split(' ')
        return filter_request[2], filter_request[3]
    
class Payment: 
    def __init__(self):
        pass

    def SetInitialPaymentStatus(self, order_id, invoice, cur):
        sql = 'insert into payments (invoice, status) values(%s, %s) RETURNING id'
        cur.execute(sql, (invoice, 'sent'))
        payment_id = cur.fetchone()[0]

        sql = 'update orders set payment_id=%s where id=%s'
        cur.execute(sql, (payment_id, order_id))
    
    def UpdatePaymentStatus(self, keys, values, cur):
        status = values[1]
        if status == "paid":
            #update payment status to PAID and set pay_time, stan and bcode
            pay_time = values[2]
            
            year = pay_time[0:4]
            month = pay_time[4:6]
            day = pay_time[6:8]
            hour = pay_time[8:10]
            minutes = pay_time[10:12]
            sec = pay_time[12:14]
            pay_time = year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + sec

            try:
                sql = 'update payments set ' + keys[1] + '=%s, ' + keys[2] + '=%s, ' + keys[3] + '=%s, ' + keys[4] + '=%s where ' + keys[0] + '=%s'
                print(sql)
                print(values, pay_time)
                cur.execute(sql, (values[1], #status value
                                  pay_time, #pay_time value
                                  values[3], #stan value
                                  values[4], #bcode value
                                  values[0], )) #invoice value
            except Exception as e:
                print(e)
        else:
            #update only payment status to [DENIED | EXPIRED]
            try: 
                sql = 'update payments set ' + keys[1] + '=%s where ' + keys[0] + '=%s'
                print(sql)
                print(values)
                cur.execute(sql, (values[1], # status value
                                  values[0], )) # invoice value
            except Exception as e:
                print(e)
            
    def EncodePaymentRequestData(self, invoice, total_price, description):
        min = 'D520908428'
        amount = str(total_price)
        exp_time = '09.12.2020'
        descr = description

        data = '''MIN=''' + min + '''
INVOICE=''' + invoice + '''
AMOUNT=''' + amount + '''
EXP_TIME=''' + exp_time + '''
DESCR=''' + descr + '''\n'''
        
        data_as_bytes = data.encode('utf-8')
        base64_encoded_data = base64.b64encode(data_as_bytes)

        return base64_encoded_data.decode('utf-8')

    def EncodeNotificationResponse(self, response):
        response_as_bytes = response.encode('utf-8')
        base64_encoded_response = base64.b64encode(response_as_bytes)
        return base64_encoded_response.decode('utf-8')


    def GenerateChecksum(self, base64_encoded, secret):
        secret = secret.encode('utf-8')
        encoded = base64_encoded.encode('utf-8')
        checksum = hmac.new(secret, encoded, hashlib.sha1).hexdigest()

        return checksum

    def ParseNotificationRequest(self, request, secret):
        params = request.split('&')

        encoded = params[0].split('=')[1]
        trailling_padding_count = len(re.findall('%3D', encoded)) #get number of trailling padding chars
        encoded = encoded[:-(trailling_padding_count * 3)] # *3 is '%3D' length
        encoded += '=' * trailling_padding_count

        received_checksum = params[1].split('=')[1]
        generated_checksum = self.GenerateChecksum(encoded, secret)
        
        return encoded, received_checksum, generated_checksum
    
    def DecodeNotificationResponse(self, encoded):
        encoded = encoded.encode('utf-8')
        encoded = base64.b64decode(encoded)
        encoded = encoded.decode('utf-8')

        return encoded

    def ParseNotificationParams(self, response):
        #response format is like: INVOICE=123456:STATUS=[PAID | DENIED | EXPIRED]:PAY_DATE=YYMMDDmmss:STAN=12345:BCODE=1a3b46
        params = response.split(':')

        keys = []
        values = []

        for param in params:
            key_value_pair = param.split('=')
            keys.append(key_value_pair[0])
            values.append(key_value_pair[1])
        
        keys = [key.lower() for key in keys]
        values = [value.lower() for value in values]

        values[len(values) - 1] = values[len(values) - 1][:-1] #remove \n from the value of the last param

        return keys, values
    
    def CheckInvoiceValid(self, invoice, cur):
        sql = 'select id from payments where invoice=%s'
        cur.execute(sql, (invoice, ))

        try:
            result = cur.fetchone()[0] #=> if this line passes there is matching invoice
            return True
        except:
            return False


class EmployeesCRUD:
    def __init__(self):
        pass

    def ReadEmployees(self, cur):
        try:
            sql ='''select e.id, e.first_name, e.last_name, e.email_address, r.name, 
                    p.create_perm, p.read_perm, p.update_perm, p.delete_perm 
                    from employees as e join roles as r on e.role_id=r.id 
                    join permissions as p on r.permission_id=p.id'''

            cur.execute(sql, )
            employees_records = cur.fetchall()

            if not employees_records is None:
                employeesJSONServer = JSONParser()
                employees_json = employeesJSONServer.GetAllEmployeesJSON(employees_records)
                response = {'status' : 'OK', 'msg' : 'Successfull', 'employees' : employees_json}
            else:
                response = {'status' : 'Fail', 'msg' : 'No employees in database', 'employees' : []}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Internal server error', 'employees' : []}

        response = json.dumps(response)
        return response

    def GeneratePermissionsInsertSql(self, permissions):
        #generate sql based on selected permissions 
        if len(permissions) > 0:
            sql_start = 'insert into permissions '
            sql_params = '('
            sql_values = 'values('

            for permission in permissions:
                sql_params += permission + ','
                sql_values += 'true,'

            sql_params = sql_params[0: len(sql_params) - 1]
            sql_values = sql_values[0: len(sql_values) - 1]

            sql_params += ') '
            sql_values += ') '

            sql = sql_start + sql_params + sql_values + 'RETURNING id'
        else:
            sql = 'insert into permissions default values RETURNING id'

        return sql
    
    def GeneratePermissionsUpdateSql(self, permissions):
        permissions_dict = {
            'create_perm' : 0,
            'read_perm' : 0,
            'update_perm' : 0,
            'delete_perm' : 0,
        }

        for permission in permissions:
            permissions_dict[permission] = 1

        sql_start = 'update permissions set '
        sql_params = ''

        for permission in permissions_dict:
            if permissions_dict[permission]:
                sql_params += permission + ' = true,'
            else:
                sql_params += permission + ' = false,'

        sql_params = sql_params[:-1]
        sql_condition = ' where id=%s'

        sql = sql_start + sql_params + sql_condition
        return sql


    def Create(self, first_name, 
                        last_name, 
                        email_address, 
                        password,
                        salt,
                        role_name, 
                        permissions, 
                        cur):
        
        #1) Add entry in permissions table
        try:
            sql = self.GeneratePermissionsInsertSql(permissions)
            cur.execute(sql)
            permission_id = cur.fetchone()[0]
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to create permissions'}
            return response

        #2) Add entry into roles table
        try:
            sql = 'insert into roles (name, permission_id) values(%s, %s) RETURNING id'
            cur.execute(sql, (role_name, permission_id, ))
            role_id = cur.fetchone()[0]
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to create given role'}
            return response

        #3) Add the employee into the database
        try:
            sql = 'insert into employees (first_name, last_name, email_address, password, role_id) values(%s, %s, %s, %s, %s)'
            dbOperator = DbOperations()
            hashed_password = dbOperator.MakePasswordHash(password + salt)
            cur.execute(sql, (first_name, last_name, email_address, hashed_password, role_id))
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to create employee'}
            return response
        
        return response
    
    def Update(self, employee_id,first_name, 
                        last_name, 
                        email_address, 
                        password,
                        salt,
                        role_id,
                        role_name,
                        permission_id, 
                        permissions, 
                        cur):

        print(permissions)

        # 1) Update permissions
        try:
            sql = self.GeneratePermissionsUpdateSql(permissions)
            print(sql)
            cur.execute(sql, (permission_id, ))
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to update permissions'}
            return response

        # 2) Update role
        try:
            sql = 'update roles set name=%s where id=%s'
            cur.execute(sql, (role_name, role_id))
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to update role'}
            return response

        # 3) Update employee
        try:
            dbOperator = DbOperations()

            sql = '''update employees set first_name=%s,
                                            last_name=%s,
                                            email_address=%s'''
            
            sql_condition = ' where id=%s'

            if password != "":
                sql += ',password=%s'
                sql += sql_condition
                hashed_password = dbOperator.MakePasswordHash(password + salt)
                cur.execute(sql, (first_name, last_name, email_address, hashed_password, employee_id))
            else:
                sql += sql_condition
                cur.execute(sql, (first_name, last_name, email_address, employee_id))
            
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to create employee'}
            return response
    
        return response
    
    def Delete(self, id, cur):
        # delete employee
        try:
            sql = 'delete from employees where id=%s'
            cur.execute(sql, (id, ))
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Enable to delete employee'}

        return response

class ProductsCRUD:
    def __init__(self):
        pass

    def ReadProducts(self, selected_sorting, offset, products_per_page, cur):
        try:
            filterParser = FiltersParser()
            #parameter: name/price/quantity...
            #direction: asc/desc
            parameter, sorting_direction = filterParser.ParseSortFilter(selected_sorting)

            # sql =  '''select p.id, p.name, p.description, m.name, m.id, p.count, p.price, p.image_name from products as p 
            #         join manufacturers as m on p.manufacturer_id=m.id'''
            
            sql =  '''select p.id, p.name, p.description, m.name, m.id, p.count, p.price, p.image_name from products as p 
                    join manufacturers as m on p.manufacturer_id=m.id order by ''' + parameter + ' ' + sorting_direction + ''' offset ''' + offset + ''' limit ''' + products_per_page
            cur.execute(sql, )
            products_records = cur.fetchall()

            sql = 'select count(*) from products'
            cur.execute(sql, )
            all_products_count = cur.fetchone()[0]
            pages_count = math.ceil(all_products_count / int(products_per_page))

            try:
                productsJSONServer = JSONParser()
                products_json = productsJSONServer.GetAllProductsBackofficeJSON(products_records)
                response = {'status' : 'OK', 'msg' : 'Successfull', 'products' : products_json, 'pages_count' : pages_count}
            except Exception as e: #=> no products in database
                print(e)
                response = {'status' : 'Fail', 'msg' : 'No products in database', 'products' : []}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Internal server error', 'products' : []}
        
        return response

    def CreateProduct(self, name, description, count, price, image_name, manufacturer_id, cur):
        try:
            sql = 'insert into products (name, description, count, price, image_name, manufacturer_id) values(%s, %s, %s, %s, %s, %s)'
            cur.execute(sql, (name, description, count, price, image_name, manufacturer_id))
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Could not create product'}

        return response
    
    def UpdateProduct(self, id, name, description, count, price, image, manufacturer_id, cur):
        try:
            sql = 'update products set name=%s, description=%s, count=%s, price=%s, image_name=%s, manufacturer_id=%s where id=%s'
            cur.execute(sql, (name, description, count, price, image, manufacturer_id, id))
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Failed', 'msg' : 'Unable to update product'}
        
        return response

    def DeleteProduct(self, id, cur):
        try:
            sql = 'delete from products where id=%s'
            cur.execute(sql, (id, ))
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to delete product'}

        return response
    

class ManufacturersCRUD:
    def __init__(self):
        pass

    def ReadManufacturers(self, cur):
        try:
            sql = 'select * from manufacturers'
            cur.execute(sql, )
            manufacturers_records = cur.fetchall()

            jsonParser = JSONParser()
            manufacturers_json = jsonParser.GetAllManufacturersJSON(manufacturers_records)
            response = {'status' : 'OK', 'msg' : 'Successful', 'manufacturers' : manufacturers_json}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to get manufacturers', 'manufacturers' : []}

        return response

class UsersCRUD:
    def __init__(self):
        pass

    def ReadUsers(self, cur):
        try:
            sql = 'select * from users'
            cur.execute(sql, )
            users_records = cur.fetchall()

            jsonParser = JSONParser()
            users_json = jsonParser.GetAllUsersJSON(users_records)
            response = {'status' : 'OK', 'msg' : 'Successfull', 'users' : users_json}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to get users', 'users' : []}

        return response

class OrdersCRUD:
    def __init__(self):
        pass

    def ReadOrders(self, cur):
        try:
            sql = '''select o.id, o.date, u.first_name, u.last_name, o.total_price, p.pay_time, p.status from orders as o
                     join users as u on o.user_id=u.id
                     join payments as p on o.payment_id=p.id'''
            cur.execute(sql, )
            orders_records = cur.fetchall()

            jsonParser = JSONParser()
            orders_json = jsonParser.GetAllOrdersJSON(orders_records)

            response = {'status' : 'OK', 'msg' : 'Successfull', 'orders' : orders_json}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to get orders', 'orders' : []}

        return response
    
    def DeleteOrders(self, id, cur):
        try:
            sql = 'delete from orders where id=%s'
            cur.execute(sql, (id, ))
            response = {'status' : 'OK', 'msg' : 'Successfull'}
        except Exception as e:
            print(e)
            response = {'status' : 'Fail', 'msg' : 'Unable to delete order'}
        
        return response

