import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword, salt, admin_pass
import random, string
import custom_modules.modules as modules
dbOperator = modules.DbOperations()

def createTables(cur, connection):    
    command = ('''

    CREATE TABLE IF NOT EXISTS users (
        "id" bigserial PRIMARY KEY,
        "first_name" text,
        "last_name" text,
        "username" text,
        "email_address" text UNIQUE,
        "password" text,
        "salt" text,
        "authenticated" boolean,
        "cart_id" bigserial UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
        "id" bigserial PRIMARY KEY,
        "name" text UNIQUE,
        "description" text,
        "manufacturer_id" bigserial,
        "count" int,
        "price" numeric,
        "image_name" text
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
        "id" bigserial PRIMARY KEY,
        "create_perm" boolean,
        "update_perm" boolean,
        "delete_perm" boolean
    );

    CREATE TABLE IF NOT EXISTS verification(
        "user_id" bigserial,
        "token" text,
        "send_date" timestamp
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

def loadData(cur, connection):
    rows_count = 100
    manufacturers_names = dbOperator.GenerateRandomNames(rows_count)
    products_names = dbOperator.GenerateRandomNames(rows_count)
    descriptions = dbOperator.GenerateRandomDescriptions(rows_count)
    image_names = dbOperator.GenerateImages(rows_count, 280, 180)

    for i in range(rows_count):
        try:
            sql = 'insert into manufacturers (name) values(%s) RETURNING id'
            cur.execute(sql, (manufacturers_names[i], ))
            manufacturer_id = cur.fetchone()[0]
        except Exception as e:
            print(e)
        
        try:
            sql = 'insert into products (name, description, manufacturer_id, count, price, image_name) values(%s, %s, %s, %s, %s, %s)'
            
            product_name = products_names[i]
            product_description = descriptions[i]
            product_count = random.randint(1, 20)
            product_price = round(random.uniform(50, 500), 2)
            image_name = image_names[i]

            cur.execute(sql, (product_name, product_description, manufacturer_id, product_count, product_price, image_name, ))
        except Exception as e:
            print(e)

def AddAdmin(cur, connection):
    try:
        try:
            sql = 'insert into permissions (create_perm, update_perm, delete_perm) values(%s, %s, %s) RETURNING id'
            cur.execute(sql, (True, True, True, )) # admin has all permissions
            admin_permissions_id = cur.fetchone()[0]
        except Exception as e:
            print(e)

        try:
            admin_role_name = 'admin'
            sql = 'insert into roles (name, permission_id) values(%s, %s) RETURNING id'
            cur.execute(sql, (admin_role_name, admin_permissions_id))
            admin_role_id =  cur.fetchone()[0]
        except Exception as e:
            print(e)
        
        first_name = 'Admin'
        last_name = 'Admin'
        email_address = 'admin@gmail.com'
        password = admin_pass + salt
        hashed_password = dbOperator.MakePasswordHash(password+salt)

        try:
            sql = 'insert into employees (first_name, last_name, email_address, password, role_id) values(%s, %s, %s, %s, %s)'
            cur.execute(sql, (first_name, last_name, email_address, hashed_password, admin_role_id))
        except Exception as e:
            print(e)
    except Exception as e:
        print(e)
    
if __name__ == '__main__':
    #connect to the database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    #createTables(cur, connection)
    #loadData(cur, connection)
    AddAdmin(cur, connection)

    cur.close()
    if connection is not None:
        connection.close()