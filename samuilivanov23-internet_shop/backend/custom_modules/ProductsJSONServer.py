class ProductJSON:
    def __init__(self):
        pass

    def GetAllProductsJSON(self, records):
        i = 0
        products = {'status' : 'OK', 'msg' : 'Successful', 'data':[]}
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
                'price' : records[i][3],
                'selected_count' : records[i][4]
            })
            
            i+=1
        return cart_products