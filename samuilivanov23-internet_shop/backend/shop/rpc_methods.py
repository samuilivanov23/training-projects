from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword

def GenerateJsonFromQueryResult(records):
    i = 0
    products = {'data':[]}
    print('PRODUCTS LEN: ' + str(len(records)))

    while i < len(records):
        product_id = records[i][0]
        product_name = records[i][1]
        product_description = records[i][2]
        product_count = records[i][4]
        product_price = float(records[i][5])

        products['data'].append({
            'id' : product_id, 
            'name' : product_name, 
            'description': product_description, 
            'count' : product_count, 
            'price' : product_price
        })

        i+=1
    
    return products

@rpc_method
def Add(a, b):
    return a + b

@rpc_method
def GetProducts(offset):
    #Connect to database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    limit_products_per_page = 15

    sql = 'select * from products order by id offset %s limit %s'
    cur.execute(sql, (offset, limit_products_per_page,))
    records = cur.fetchall()

    response_data = GenerateJsonFromQueryResult(records)
    data_json = json.dumps(response_data)
    
    return data_json