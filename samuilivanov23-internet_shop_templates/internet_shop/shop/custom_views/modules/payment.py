import datetime
import hmac, base64, hashlib
import re, random
from internet_shop.conf import secret

class Payment:
    def GeneratePaymentRequestData(self, order_id, total_price, cur, connection):
        try:
            invoice = str(random.randint(0, 1000000))
            description = "default"
            encoded = self.EncodePaymentRequestData(invoice, total_price, description)
        except Exception as e:
            print(e)
            context = {'message' : 'Unable to encode data'}

        try:
            checksum = self.GenerateChecksum(encoded, secret)
        except Exception as e:
            print(e)
            context = {'message' : 'Unable to generate checksum'}

        try:
            self.SetInitialPaymentStatus(order_id, invoice, cur, connection)
        except Exception as e:
            print(e)
            context = {'message' : 'Unable to insert payment data into database'}

        context = {'message' : 'Successfull', 'encoded' : encoded, 'checksum' : checksum}
        return context
    
    def EncodePaymentRequestData(self, invoice, total_price, description):
        min = 'D520908428'
        amount = str(total_price)
        exp_time = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%d.%m.%Y') #get tomorrow date
        descr = description

        data = '''MIN=''' + min + '''
INVOICE=''' + invoice + '''
AMOUNT=''' + amount + '''
EXP_TIME=''' + exp_time + '''
DESCR=''' + descr + '''\n'''
        
        data_as_bytes = data.encode('utf-8')
        base64_encoded_data = base64.b64encode(data_as_bytes)

        return base64_encoded_data.decode('utf-8')

    def SetInitialPaymentStatus(self, order_id, invoice, cur, connection):
        try:
            sql = 'insert into payments (invoice, status) values(%s, %s) RETURNING id'
            cur.execute(sql, (invoice, 'not sent'))
            payment_id = cur.fetchone()[0]

            sql = 'update orders set payment_id=%s where id=%s'
            cur.execute(sql, (payment_id, order_id))
            connection.commit()
        except Exception as e:
            print(e)
    
    def SetStatusSent(self, order_id, cur, connection):
        try:
            sql = 'select payment_id from orders where id=%s'
            cur.execute(sql, (order_id, ))
            payment_id = cur.fetchone()[0]

            sql = 'update payments set status=%s where id=%s'
            cur.execute(sql, ('sent', payment_id))
            connection.commit()
            response = {'status' : 'OK', 'msg' : 'Successfull sent payment request'}
            context = {'payment_request_message' : 'Successfull sent payment request'}
        except Exception as e:
            print(e)
            context = {'payment_request_message' : 'Unable to update payment status to sent'}

        return context
    
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