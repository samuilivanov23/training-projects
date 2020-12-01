from django.http import HttpResponse
import json

# Create your views here.

def index(request):
    data = {
        'name': 'Sarah',
        'age': '20',
        'email': 'sarah@gmail.com' 
    }

    data_json = json.dumps(data)
    return HttpResponse(data_json)