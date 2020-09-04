import psycopg2
import csv
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword
import os
import re
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import zipfile, glob

def importDataByAuthor(author_name_latin, author_name_cyrillic):
    word_id, book_id, author_id = 1, 1, 1

    author_name = author_name_latin
    folder_location = "../books/" + author_name_cyrillic

    url = "https://chitanka.info/person/" + author_name

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    print("\nauthor: " + author_name)

    #using regex to match the starting pattern and everything else after that
    for book_link in soup.find_all("a", {'title': re.compile(r'^Сваляне във формат txt.zip')}):
        #Name the files using the last portion of the link

        if book_link['href'].split('/')[-2] == "text":
            #while True:
            try:
                book_name = book_link['href'].split('/')[-1]
                filename = os.path.join(folder_location, book_name)
                print(filename)

                if not os.path.exists(folder_location):os.mkdir(folder_location)

                f = open(filename, 'wb')
                f.write(requests.get(urljoin(url,book_link['href'])).content)
                f.close()

                file_location = folder_location + "/" + book_name
                dir_location = folder_location + "/"

                zip_data = zipfile.ZipFile(file_location, mode="r")
                zip_infos = zip_data.infolist()

                unzipped_file_name = book_name[:(len(book_name)-4)] #to skip the last four characters which are ".zip"
                root_password = chitanka_dbpassword
                for zip_info in zip_infos:
                    zip_info.filename = unzipped_file_name
                    zip_data.extract(zip_info, path=dir_location, pwd=root_password.encode('utf-8'))
                
                zip_data.close()

                print("\n")
            except:
                print("\n\n")
                print("Failed to download and unzip book: " + file_location)
                print("Making another try")

                #delete the zip and txt files
                zip_file_delete = filename
                txt_file_delete = os.path.join(folder_location, unzipped_file_name)
                if os.path.isfile(zip_file_delete):
                    os.remove(zip_file_delete)
                elif os.path.isfile(txt_file_delete):
                    os.remove(txt_file_delete)
                else:
                    print("Nothing to delete\n\n")

                try:
                    print(filename)

                    if not os.path.exists(folder_location):os.mkdir(folder_location)

                    f = open(filename, 'wb')
                    f.write(requests.get(urljoin(url,book_link['href'])).content)
                    f.close()

                    file_location = folder_location + "/" + book_name
                    dir_location = folder_location + "/"

                    zip_data = zipfile.ZipFile(file_location, mode="r")
                    zip_infos = zip_data.infolist()

                    unzipped_file_name = book_name[:(len(book_name)-4)] #to skip the last four characters which are ".zip"
                    root_password = chitanka_dbpassword
                    for zip_info in zip_infos:
                        zip_info.filename = unzipped_file_name
                        zip_data.extract(zip_info, path=dir_location, pwd=root_password.encode('utf-8'))
                    
                    zip_data.close()

                    print("\n")
                except:
                    print("FAILED..END")
                
                #if os.path.isfile("../books/" + author_name + "/" + unzipped_file_name):
                    #break


        my_file = os.path.join(folder_location, unzipped_file_name)
        f = open(my_file, encoding='utf-8', mode='r')
        file_content = f.read()
        f.close()

        current_file_words = list(set(re.findall("[а-яА-Я]{3,}", file_content)))

        #connect to the database
        try:
            connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                        "' user='" + chitanka_dbuser + 
                                        "' password='" + chitanka_dbpassword + "'")

            connection.autocommit = True
            cur = connection.cursor()

            initial_author_id = author_id #for the books table
            sql = 'insert into public."Authors" (id, name) values(%s, %s);'
            try:
                cur.execute(sql, (str(author_id), author_name))
                author_id+=1
            except:
                print("skipping author: " + author_name)
                author_id+=1
                
            connection.commit()

            initial_book_id = book_id #for the words table
            sql = 'insert into public."Books" (id, name, author_id) values(%s, %s, %s);'
            try:
                cur.execute(sql, (str(book_id), book_name, str(initial_author_id)))
                book_id+=1
            except:
                print("skipping book: " + book_name)
                book_id+=1
                    
            connection.commit()

            sql = 'insert into public."Words" (id, word, book_id) values(%s, %s, %s);'
            for word in current_file_words:
                try:
                    cur.execute(sql, (str(word_id), word.lower(), str(initial_book_id)))
                    word_id+=1
                except:
                    print("skipping word: " + word)
                    word_id+=1
            
            f.close()
            connection.commit()
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
        finally:
            if connection is not None:
                connection.close()

def importData():
    i = 1

    while i <= 75:
        url = "https://chitanka.info/authors/first-name/-.html/" + str(i)

        print("page: " + str(i))
        print(url)

        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        for author_link in soup.find("ul", class_="superlist").find_all("a", itemprop="url"):
            #create separate folder for each author's books
            author_name = author_link['href'].split('/')[-1]
            folder_location = "../books/" + author_name

            url = "https://chitanka.info/person/" + author_name

            response = requests.get(url)
            soup = BeautifulSoup(response.text, "html.parser")

            print("\nauthor: " + author_name)

            #using regex to match the starting pattern and everything else after that
            for book_link in soup.find_all("a", {'title': re.compile(r'^Сваляне във формат txt.zip')}):
                #Name the files using the last portion of the link

                if book_link['href'].split('/')[-2] == "text":
                    while True:
                        try:
                            book_name = book_link['href'].split('/')[-1]
                            filename = os.path.join(folder_location, book_name)
                            print(filename)
                            print("index: " + str(i))

                            if not os.path.exists(folder_location):os.mkdir(folder_location)

                            f = open(filename, 'wb')
                            f.write(requests.get(urljoin(url,book_link['href'])).content)
                            f.close()

                            file_location = folder_location + "/" + book_name
                            dir_location = folder_location + "/"

                            zip_data = zipfile.ZipFile(file_location, mode="r")
                            zip_infos = zip_data.infolist()

                            unzipped_file_name = book_name[:(len(book_name)-4)] #to skip the last four characters which are ".zip"
                            root_password = chitanka_dbpassword
                            for zip_info in zip_infos:
                                zip_info.filename = unzipped_file_name
                                zip_data.extract(zip_info, path=dir_location, pwd=root_password.encode('utf-8'))
                            
                            zip_data.close()

                            print("\n")
                        except:
                            print("\n\n")
                            print("Failed to download and unzip book: " + file_location)
                            print("Making another try")

                            #delete the zip and txt files
                            zip_file_delete = filename
                            txt_file_delete = os.path.join(folder_location, unzipped_file_name)
                            if os.path.isfile(zip_file_delete):
                                os.remove(zip_file_delete)
                            elif os.path.isfile(txt_file_delete):
                                os.remove(txt_file_delete)
                            else:
                                print("Nothing to delete\n\n")

                            try:
                                print(filename)
                                print("index: " + str(i))

                                if not os.path.exists(folder_location):os.mkdir(folder_location)

                                f = open(filename, 'wb')
                                f.write(requests.get(urljoin(url,book_link['href'])).content)
                                f.close()

                                file_location = folder_location + "/" + book_name
                                dir_location = folder_location + "/"

                                zip_data = zipfile.ZipFile(file_location, mode="r")
                                zip_infos = zip_data.infolist()

                                unzipped_file_name = book_name[:(len(book_name)-4)] #to skip the last four characters which are ".zip"
                                root_password = chitanka_dbpassword
                                for zip_info in zip_infos:
                                    zip_info.filename = unzipped_file_name
                                    zip_data.extract(zip_info, path=dir_location, pwd=root_password.encode('utf-8'))
                                
                                zip_data.close()

                                print("\n")
                            except:
                                print("FAILED..END")
                        
                        if os.path.isfile("../books/" + author_name + "/" + unzipped_file_name):
                            break
                        
        print("\n")
        i += 1

if __name__ == '__main__':
    #importAllData()
    importDataByAuthor("ivan-dimitrov", "Иван-Димитров")