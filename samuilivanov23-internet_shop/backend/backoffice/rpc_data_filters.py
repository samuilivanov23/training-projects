from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import traceback
import custom_modules.modules as modules

filterParser = modules.FiltersParser()
productsJSONServer = modules.JSONParser()

@rpc_method
def FilterProductsBackoffice(filter):
    #sorting_direction -> asc/desc
    #parameter -> name/price
    parameter, sorting_direction = filterParser.ParseSortFilter(filter)
    print(parameter, sorting_direction)

    #Connect to database
    try:
        connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                    "' user='" + onlineShop_dbuser + 
                                    "' password='" + onlineShop_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()
    except Exception as e:
        print(e)

    try:
        #sql = 'select * from products order by ' + parameter + ' ' + sorting_direction

        sql =  '''select p.id, p.name, p.description, m.name, m.id, p.count, p.price, p.image_name from products as p 
                    join manufacturers as m on p.manufacturer_id=m.id order by ''' + parameter + ' ' + sorting_direction

        cur.execute(sql, )
        products_records = cur.fetchall()

        # sql = 'select count(*) from products'
        # cur.execute(sql,)
        # pages_count = int(cur.fetchone()[0] / products_per_page)

        products_json = productsJSONServer.GetAllProductsBackofficeJSON(products_records)
        response = {'status' : 'OK', 'msg' : 'Successfull', 'products' : products_json}
    except Exception as e:
        response = {'status' : 'Fail', 'msg' : 'Unable to get products', 'data':[]}
        print(e)
    
    if(connection):
        cur.close()
        connection.close()

    response = json.dumps(response)
    print(response)
    return response