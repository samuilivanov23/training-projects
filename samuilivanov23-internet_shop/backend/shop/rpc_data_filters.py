from modernrpc.core import rpc_method
import json
import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import traceback
import custom_modules.modules as modules

filterParser = modules.FiltersParser()

@rpc_method
def FilterProducts(filter):
    print(filter)
    
    #type -> asc/desc
    #parameter -> 
    parameter, type = filterParser.ParseSortFilter(filter)
    print(parameter, type)
    return ''