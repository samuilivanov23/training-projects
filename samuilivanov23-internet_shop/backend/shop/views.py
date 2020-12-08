#from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json, base64
from custom_modules.modules import Payment
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.dbconfig import secret
import psycopg2

# Create your views here.

def index(request):
    print(request)
    # data = {
    #     'name': 'Sarah',
    #     'age': '20',
    #     'email': 'sarah@gmail.com' 
    # }

    data = "ENCODED=INVOICE:123456:STATUS:OK"
    #data_json = json.dumps(data)
    return HttpResponse(data)

@csrf_exempt
def ProccessEpayNotification(request):
    body = request.body
    body = body.decode('utf-8')

    payment = Payment()
    encoded, received_checksum, generated_checksum = payment.ParseNotificationRequest(body, secret)
    
    if(generated_checksum == received_checksum):
        print('VALID CHECKSUM')
        response_data = payment.DecodeNotificationResponse(encoded)
        print(response_data)

        # response_message = "INVOICE=123456:STATUS=OK"
        # encoded_response = payment.EncodeNotificationResponse(response_message)
        # notification_response_checksum = payment.GenerateChecksum(encoded_response, secret)
        # response = "ENCODED=" + encoded_response + "CHECKSUM=" + notification_response_checksum

        #Connect to database
        try:
            connection = psycopg2.connect("dbname='" + onlineShop_dbname +
                                        "' user='" + onlineShop_dbuser +
                                        "' password='" + onlineShop_dbpassword + "'")

            connection.autocommit = True
            cur = connection.cursor()
        except Exception as e:
            print(e)

        invoice = payment.ParseNotificationInvoice(response_data)

        if payment.CheckInvoiceValid(invoice, cur):
            response = "INVOICE=" + invoice + ":STATUS=OK"
        else:
            response = "INVOICE=" + invoice + ":STATUS=NO"

        return HttpResponse(response)

    else:
        print("INVALID CHECKSUM")

        # response_message = "INVOICE=123456:STATUS=грешна CHECKSUM"
        # encoded_response = payment.EncodeNotificationResponse(response_message)
        # notification_response_checksum = payment.GenerateChecksum(encoded_response, secret)
        # response = "ENCODED=" + encoded_response + "CHECKSUM=" + notification_response_checksum

        response = "INVOICE=123456:STATUS=грешна CHECKSUM"
        return HttpResponse(response)