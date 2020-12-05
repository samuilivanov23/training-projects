#from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json, base64

# Create your views here.

def index(request):
    print(request)
    data = {
        'name': 'Sarah',
        'age': '20',
        'email': 'sarah@gmail.com' 
    }

    data_json = json.dumps(data)
    return HttpResponse(data_json)

def ParseRequest(request):
    params = request.split('&')
    
    encoded = params[0][:-6].split('=')[1] #:-6 to skip the padding %3D%3D
    checksum = params[1].split('=')[1]

    encoded += '==='
    
    return encoded, checksum


@csrf_exempt
def ProccessEpayNotification(request):
    body = request.body
    body = body.decode('utf-8')
    
    encoded, checksum = ParseRequest(body)

    print(encoded)
    print(checksum)
  
    encoded = encoded.encode('utf-8')
    encoded = base64.b64decode(encoded)
    encoded = encoded.decode('utf-8')
    
    print(encoded)
    # body_unicode = request.body.decode('utf-8')
    # body = json.loads(body_unicode)
    
    #print(body)

    response = {
        'status' : 'OK'
    }

    response = json.dumps(response)
    return HttpResponse(response)