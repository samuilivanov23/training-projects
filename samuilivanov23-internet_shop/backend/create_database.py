import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
import random, string

def createTables(cur, connection):    
    command = ('''

    CREATE TABLE IF NOT EXISTS users (
        "id" bigserial PRIMARY KEY,
        "first_name" text,
        "last_name" text,
        "email_address" text UNIQUE,
        "password" text UNIQUE,
        "cart_id" bigserial UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
        "id" bigserial PRIMARY KEY,
        "name" text UNIQUE,
        "description" text,
        "manufacturer_id" bigserial,
        "count" int,
        "price" numeric
    );

    CREATE TABLE IF NOT EXISTS carts(
        "id" bigserial PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS carts_products(
        "cart_id" bigserial,
        "product_id" bigserial,
        "count" int
    );

    CREATE TABLE IF NOT EXISTS manufacturers(
        "id" bigserial PRIMARY KEY,
        "name" text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tags(
        "id" bigserial PRIMARY KEY,
        "name" text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tags_products(
        "tag_id" bigserial,
        "product_id" bigserial
    );

    CREATE TABLE IF NOT EXISTS orders(
        "id" bigserial PRIMARY KEY,
        "date" timestamp,
        "total_price" numeric,
        "user_id" bigserial
    );

    CREATE TABLE IF NOT EXISTS orders_products(
        "order_id" bigserial,
        "product_id" bigserial,
        "count" int
    );

    CREATE TABLE IF NOT EXISTS employees(
        "id" bigserial PRIMARY KEY,
        "first_name" text,
        "last_name" text,
        "email_address" text,
        "password" text,
        "role_id" int
    );

    CREATE TABLE IF NOT EXISTS roles(
        "id" bigserial PRIMARY KEY,
        "name" text,
        "permission_id" int
    );

    CREATE TABLE IF NOT EXISTS permissions(
        "id" int PRIMARY KEY,
        "create" boolean,
        "update" boolean,
        "delete" boolean
    );

    ALTER TABLE products ADD FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id);

    ALTER TABLE orders ADD FOREIGN KEY (user_id) REFERENCES users (id);

    ALTER TABLE employees ADD FOREIGN KEY (role_id) REFERENCES roles (id);

    ALTER TABLE roles ADD FOREIGN KEY (permission_id) REFERENCES permissions (id);


    ALTER TABLE carts_products ADD CONSTRAINT pk_carts_products PRIMARY KEY (cart_id, product_id);

    ALTER TABLE carts_products ADD FOREIGN KEY (cart_id) REFERENCES carts (id);

    ALTER TABLE carts_products ADD FOREIGN KEY (product_id) REFERENCES products (id);

    ALTER TABLE tags_products ADD FOREIGN KEY (tag_id) REFERENCES carts (id);

    ALTER TABLE tags_products ADD FOREIGN KEY (product_id) REFERENCES products (id);

    ALTER TABLE orders_products ADD FOREIGN KEY (order_id) REFERENCES orders (id);

    ALTER TABLE orders_products ADD FOREIGN KEY (product_id) REFERENCES products (id);

    ''')

    #connect to the database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    try:
        #create the tables in the database
        cur.execute(command)
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        connection = None
    finally:
        if connection is not None:
            connection.close()

def generateRandomNames(count):
    import random, string
    names = []
    for i in range(count):
        letters = string.ascii_lowercase
        name_length = random.randint(5, 10)
        name = ''.join(random.choice(letters) for i in range(name_length))
        names.append(name)
    
    return names

def generateRandomDescriptions(count):
    descriptions = []
    for i in range(count):
        letters = string.ascii_lowercase + ' '
        description_length = random.randint(30, 40)
        description = ''.join(random.choice(letters) for i in range(description_length))
        descriptions.append(description)
    
    return descriptions

def loadData(cur, connection):
    rows_count = 1000
    manufacturers_names = generateRandomNames(rows_count)
    products_names = generateRandomNames(rows_count)
    descriptions = generateRandomDescriptions(rows_count)

    for i in range(rows_count):
        try:
            sql = 'insert into manufacturers (name) values(%s) RETURNING id'
            cur.execute(sql, (manufacturers_names[i], ))
            manufacturer_id = cur.fetchone()[0]
        except Exception as e:
            print(e)
        
        try:
            sql = 'insert into products (name, description, manufacturer_id, count, price) values(%s, %s, %s, %s, %s)'
            
            product_name = products_names[i]
            product_description = descriptions[i]
            product_count = random.randint(1, 20)
            product_price = round(random.uniform(50, 500), 2)
            
            cur.execute(sql, (product_name, product_description, manufacturer_id, product_count, product_price, ))
        except Exception as e:
            print(e)

    try:
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        connection = None
    finally:
        if connection is not None:
            connection.close()

if __name__ == '__main__':
    #connect to the database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    createTables(cur, connection)
    loadData(cur, connection)