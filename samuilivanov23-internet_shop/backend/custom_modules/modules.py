import hashlib
from PIL import Image
import random, string

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
                'price' : float(records[i][3]),
                'selected_count' : records[i][4],
                'count' : records[i][5]
            })
            
            i+=1
        return cart_products

class DbOperations:
    def __init__(self):
        pass

    def MakePasswordHash(self, password):
        hashed_password = hashlib.sha256(str.encode(password)).hexdigest()
        return hashed_password

    def CheckPasswordHash(self, password, hashed_password):
        if password == hashed_password:
            return True
        else:
            return False
    
    def GenerateImages(self, count, sizeX, sizeY):
        color = '#34a1eb' #skyblue
        image_paths = []
        
        for i in range(count):
            img = Image.new("RGB", (sizeX, sizeY), color)
            folder_location = '/media/samuil2001ivanov/808137c8-9dff-4126-82f4-006ab928a3fc1/django_projects/internet_shop/images/'
            file_location = folder_location + 'image' + str(i) + '.png'
            img.save(file_location, 'PNG')
            image_paths.append(file_location)
        
        return image_paths
    
    def GenerateRandomNames(self, count):
        import random, string
        names = []

        for _ in range(count):
            letters = string.ascii_lowercase
            name_length = random.randint(5, 10)
            name = ''.join(random.choice(letters) for i in range(name_length))
            names.append(name)
        
        return names

    def GenerateRandomDescriptions(self, count):
        descriptions = []
    
        for _ in range(count):
            letters = string.ascii_lowercase + ' '
            description_length = random.randint(30, 40)
            description = ''.join(random.choice(letters) for i in range(description_length))
            descriptions.append(description)
        
        return descriptions