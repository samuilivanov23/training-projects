from modernrpc.core import rpc_method
import json

@rpc_method
def add(a, b):
    return a + b

@rpc_method
def getProducts():
    data = {
        'name': 'Sarah',
        'age': '20',
        'email': 'sarah@gmail.com'
    }

    data_json = json.dumps(data)
    return data_json