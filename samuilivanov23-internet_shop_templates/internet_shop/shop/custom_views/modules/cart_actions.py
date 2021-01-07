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