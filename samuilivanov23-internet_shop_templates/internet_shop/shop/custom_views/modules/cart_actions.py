class Cart():
    def __init__(self):
        pass

    def AddProductToCard(self, product_id, selected_count, product_count, cart_id, cur):
        if int(selected_count) <= int(product_count) and selected_count > 0:
            #Add product to cart
            try:
                sql = 'insert into carts_products (cart_id, product_id, count) values(%s, %s, %s)'
                print(cart_id, product_id)
                cur.execute(sql, (cart_id, product_id, selected_count))
            except Exception as e:
                print('Unable to add product to cart')
                print(e)
    
    def CheckProductInStock(self, selected_count, count_in_stock):
        if selected_count <= count_in_stock:
            return True
        else:
            return False

    def AddProductsIntoOrder(self, cart_products, cart_id, user_id, total_price, cur):
        try:
            sql = 'insert into orders (total_price, user_id) values(%s, %s) RETURNING id'
            cur.execute(sql, (total_price, user_id))
            order_id = cur.fetchone()[0]

            for i in range(len(cart_products) - 1):
                product_id = cart_products[i][0]
                selected_count = cart_products[i][6]
                count_in_stock = cart_products[i][3]

                if(self.CheckProductInStock(selected_count, count_in_stock)):
                    try:
                        sql = 'insert into orders_products (order_id, product_id, count) values(%s, %s, %s)'
                        cur.execute(sql, (order_id, product_id, selected_count))
                    except Exception as e:
                        print(e)
                else:
                    response = 0
                    return response
            
            response = 1
        except Exception as e:
            print('Inable to add products into order')
            print(e)
        
        return response