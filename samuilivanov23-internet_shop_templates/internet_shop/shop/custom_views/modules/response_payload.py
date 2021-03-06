class ResponsePayloadOperations:
    def ProductsJSON(self, records): 
        products = []

        i = 0
        while i < len(records):

            products.append({
                'id' : records[i][0],
                'name' : records[i][1],
                'description': records[i][2],
                'count' : records[i][3],
                'price' : float(records[i][4]),
            })

            i+=1
        
        return products

    def ProductDetailsJSON(self, record): 
        product = {
            'id' : record[0],
            'name' : record[1],
            'description': record[2],
            'count' : record[3],
            'price' : float(record[4]),
            'manufacturer_name' : record[5]
        }
        
        return product
    
    def CartProductsJSON(self, records):
        cart = {'products' : [], 'total_price' : records[len(records) - 1][5]}

        i = 0;
        while i < len(records) - 1:
            cart['products'].append({
                'id' : records[i][0],
                'name' : records[i][1],
                'description': records[i][2],
                'count' : records[i][3],
                'price' : float(records[i][4]),
                'total_price' : float(records[i][5])
            })
            
            i+=1
        return cart
