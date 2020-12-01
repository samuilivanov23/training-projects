from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import traceback
import custom_modules.modules as modules

filterParser = modules.FiltersParser()
productsJSONServer = modules.JSONParser()

@rpc_method
def FilterProducts(filter, offset, products_per_page):
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
        sql = 'select * from products order by ' + parameter + ' ' + sorting_direction + ' offset %s limit %s'
        cur.execute(sql, (offset, products_per_page,))
        records = cur.fetchall()

        sql = 'select count(*) from products'
        cur.execute(sql,)
        pages_count = int(cur.fetchone()[0] / products_per_page)

        response = productsJSONServer.GetAllProductsJSON(records, pages_count)
    except Exception as e:
        response = {'status' : 'Fail', 'msg' : 'Unable to get products', 'data':[], 'pages_count' : 0}
        print(e)
    
    if(connection):
        cur.close()
        connection.close()

    response = json.dumps(response)
    print(response)
    return response