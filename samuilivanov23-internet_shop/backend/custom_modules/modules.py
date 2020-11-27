import hashlib
from PIL import Image
import random, string
import uuid, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import traceback

class JSONParser:
    def __init__(self):
        pass

    def GetAllProductsJSON(self, records, product_records_count): 
        response = {'status' : 'OK', 'msg' : 'Successful', 'data': [], 'pages_count' : product_records_count}
        print('PRODUCTS LEN: ' + str(len(records)))

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

        print('Start SendEmail')

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
                <a href="http://localhost:3000/confirm/""" + token + """">Please click here to verify.</a>
                </p>
            </body>
        </html>
        """

        print('Attaching MIMEtext')
        try:
            message.attach(MIMEText(email_content, 'html'))
        except:
            print(traceback.format_exc())

        print('CREATING SSL context')
        try:
            #Create secure connection with the server and send the email
            context = ssl.create_default_context()
        except:
            print(traceback.format_exc())

        print('SENDING Email')
        try:
            with smtplib.SMTP_SSL(server_email, server_port, context=context) as server:
                server.login(sender_email, sender_password)
                server.sendmail(
                    sender_email, receiver_email, message.as_string()
                )

            print('SUCCESSFUL')
            response = {'status' : 'Success', 'msg' : 'Email send successfully', 'token' : token}
        except:
            print(traceback.format_exc())
            response = {'status' : 'Fail', 'msg' : 'Unable to send mail to user'}
        
        return response