import psycopg2
from internet_shop.dbconfig import onlineShop_dbname, onlineShop_dbuser, onlineShop_dbpassword
from internet_shop.conf import salt, admin_pass
from shop.custom_views.modules import database_operations
import random, string
import threading

dbOperator = database_operations.DbOperations()

def createTables(cur, connection):    
    command = ('''

    CREATE TABLE IF NOT EXISTS users (
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "first_name" text,
        "last_name" text,
        "username" text,
        "email_address" text UNIQUE,
        "password" text,
        "salt" text,
        "authenticated" boolean default false,
        "cart_id" bigserial UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "name" text UNIQUE,
        "description" text,
        "manufacturer_id" bigserial,
        "count" int,
        "price" numeric,
        "image_name" text,
        "is_deleted" boolean default false
    );

    CREATE TABLE IF NOT EXISTS carts(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS carts_products(
        "cart_id" bigserial,
        "product_id" bigserial,
        "count" int
    );

    CREATE TABLE IF NOT EXISTS manufacturers(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "name" text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tags(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "name" text UNIQUE
    );

    CREATE TABLE IF NOT EXISTS tags_products(
        "tag_id" bigserial,
        "product_id" bigserial
    );

    CREATE TABLE IF NOT EXISTS orders(
        "id" bigserial PRIMARY KEY,
        "date" timestamp NOT NULL DEFAULT NOW(),
        "total_price" numeric,
        "user_id" bigserial,
        "payment_id" bigserial,
        "is_deleted" boolean default false
    );

    CREATE TABLE IF NOT EXISTS orders_products(
        "order_id" bigserial,
        "product_id" bigserial,
        "count" int
    );

    CREATE TABLE IF NOT EXISTS payments(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "invoice" int NOT NULL,
        "status" text NOT NULL,
        "stan" text ,
        "bcode" text
    );

    CREATE TABLE IF NOT EXISTS employees(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "first_name" text,
        "last_name" text,
        "email_address" text UNIQUE,
        "password" text,
        "role_id" int
        "cart_id" bigserial UNIQUE
    );

    CREATE TABLE IF NOT EXISTS roles(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "name" text,
        "permission_id" int
    );

    CREATE TABLE IF NOT EXISTS permissions(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "create_perm" boolean default false,
        "read_perm" boolean default false,
        "update_perm" boolean default false,
        "delete_perm" boolean default false
    );

    CREATE TABLE IF NOT EXISTS verification(
        "user_id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "token" text,
        "send_date" timestamp NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS income(
        "id" bigserial PRIMARY KEY,
        "inserted_at" timestamp NOT NULL DEFAULT NOW(),
        "money" numeric
    );


    ALTER TABLE users ADD FOREIGN KEY (cart_id) REFERENCES carts (id);

    ALTER TABLE products ADD FOREIGN KEY (manufacturer_id) REFERENCES manufacturers (id);

    ALTER TABLE orders ADD FOREIGN KEY (user_id) REFERENCES users (id);

    ALTER TABLE orders ADD FOREIGN KEY (payment_id) REFERENCES payments (id);

    ALTER TABLE employees ADD FOREIGN KEY (role_id) REFERENCES roles (id);

    ALTER TABLE employees ADD FOREIGN KEY (cart_id) REFERENCES carts (id);

    ALTER TABLE roles ADD FOREIGN KEY (permission_id) REFERENCES permissions (id);


    ALTER TABLE carts_products ADD CONSTRAINT pk_carts_products PRIMARY KEY (cart_id, product_id);

    ALTER TABLE carts_products ADD FOREIGN KEY (cart_id) REFERENCES carts (id);

    ALTER TABLE carts_products ADD FOREIGN KEY (product_id) REFERENCES products (id);

    ALTER TABLE tags_products ADD FOREIGN KEY (tag_id) REFERENCES tags (id);

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

def loadData(cur, connection, rows):
    rows_count = rows
    product_letters = string.ascii_lowercase
    description_letters = string.ascii_lowercase + ' '

    for _ in range(rows_count):    
        try:
            sql = 'insert into products (name, description, manufacturer_id, count, price, image_name) values(%s, %s, %s, %s, %s, %s)'
            
            product_name_length = random.randint(5, 10)
            product_name = ''.join(random.choice(product_letters) for i in range(product_name_length))

            description_length = random.randint(30, 40)
            product_description = ''.join(random.choice(description_letters) for i in range(description_length))

            #product_name = products_names[i]
            #product_description = descriptions[i]
            product_count = random.randint(1, 20)
            product_price = round(random.uniform(50, 500), 2)
            image_name = "gopro.png"
            manufacturer_id = random.randint(1, 100)

            cur.execute(sql, (product_name, product_description, manufacturer_id, product_count, product_price, image_name, ))
        except Exception as e:
            print(e)

def AddUsers(rows, thread_id):
    #connect to the database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    for _ in range(rows):
        try:
            sql = 'insert into carts default values RETURNING id'
            cur.execute(sql, )
            cart_id = cur.fetchone()[0]
            connection.commit()

            sql = 'insert into users (first_name, last_name, username, password, salt, cart_id) values(%s, %s, %s, %s, %s, %s)'
            cur.execute(sql, ('first_name_test', 'last_name_test', 'stamat.stamatov', 'qazwsxedc', 'asdf', cart_id))
            connection.commit()

            print("thread: " + str(thread_id))
        except Exception as e:
            print(e)
    
    cur.close()
    if connection is not None:
        connection.close()

def AddEmployees(rows, thread_id):
    #connect to the database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    for _ in range(rows):
        try:
            role_id = random.randint(1,10)

            sql = 'insert into employees (first_name, last_name, password, role_id) values(%s, %s, %s, %s)'
            cur.execute(sql, ('first_name_test', 'last_name_test', 'qazwsxedc', role_id))
            connection.commit()

            print("thread: " + str(thread_id))
        except Exception as e:
            print(e)
    
    cur.close()
    if connection is not None:
        connection.close()

def AddAdmin(cur, connection):
    try:
        try:
            sql = 'insert into permissions (create_perm, read_perm, update_perm, delete_perm) values(%s, %s, %s, %s) RETURNING id'
            cur.execute(sql, (True, True, True, True, )) # admin has all permissions
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
        hashed_password = dbOperator.MakePasswordHash(password)

        try:
            sql = 'insert into employees (first_name, last_name, email_address, password, role_id) values(%s, %s, %s, %s, %s)'
            cur.execute(sql, (first_name, last_name, email_address, hashed_password, admin_role_id))
        except Exception as e:
            print(e)
    except Exception as e:
        print(e)

def AddInitialIncome(cur):
    try:
        sql = 'insert into income (money) values(0)'
        cur.execute(sql, )
    except Exception as e:
        print("Unable to insert initial income value")
        print(e)
        
    
if __name__ == '__main__':
    #connect to the database
    connection = psycopg2.connect("dbname='" + onlineShop_dbname + 
                                  "' user='" + onlineShop_dbuser + 
                                  "' password='" + onlineShop_dbpassword + "'")

    connection.autocommit = True
    cur = connection.cursor()

    #createTables(cur, connection)
    # rows_per_thread = 10000
    # threads = []
    # for i in range(10):
    #     thread = threading.Thread(target=AddEmployees, args=(rows_per_thread, i))
    #     threads.append(thread)
    #     thread.start()
    #loadData(cur, connection)
    #AddAdmin(cur, connection)

    AddInitialIncome(cur)

    cur.close()
    if connection is not None:
        connection.close()