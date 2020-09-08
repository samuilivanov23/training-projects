import psycopg2
import csv
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword
import os
import re, nltk
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import zipfile, glob

def importData():
    word_id, sentence_id, book_id, author_id = 246943, 1857022, 792, 102
    i = 2

    while i <= 2:
        url = "https://chitanka.info/authors/first-name/-.html/" + str(i)

        print("page: " + str(i))
        print(url)

        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        for author_link in soup.find("ul", class_="superlist").find_all("a", itemprop="url"):
            #create separate folder for each author's books
            author_name = author_link['href'].split('/')[-1]

            url = "https://chitanka.info/person/" + author_name

            response = requests.get(url)
            soup = BeautifulSoup(response.text, "html.parser")

            tag_with_name = soup.find("h1")
            author_name_whitecpace = tag_with_name.get_text().strip()
            cyrillic_name = re.sub('\s+', '-', author_name_whitecpace)
            folder_location = "../books/" + cyrillic_name

            print("\nauthor: " + author_name)

            #using regex to match the starting pattern and everything else after that
            for book_link in soup.find_all("a", {'title': re.compile(r'^Сваляне във формат txt.zip')}):
                #Name the files using the last portion of the link
                if book_link['href'].split('/')[-2] == "text":
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

                    
                    my_file = os.path.join(folder_location, unzipped_file_name)
                    f = open(my_file, encoding='utf-8', mode='r')
                    file_content = f.read()
                    f.close()

                    current_file_words = list(set(re.findall("[а-яА-Я]{3,}", file_content)))
                    sentences = nltk.tokenize.sent_tokenize(file_content)

                    #connect to the database
                    try:
                        connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                                    "' user='" + chitanka_dbuser + 
                                                    "' password='" + chitanka_dbpassword + "'")

                        connection.autocommit = True
                        cur = connection.cursor()

                        initial_author_id = author_id #for the books table
                        sql = 'insert into public."Authors" (id, name) values(%s, %s)'
                        try:
                            cur.execute(sql, (author_id, cyrillic_name))
                            connection.commit()
                        except Exception as e:
                            print("")
                        
                        print("author_id: " + str(author_id))

                        initial_book_id = book_id #for the words table
                        sql = 'insert into public."Books" (id, name, author_id, words_count, sentences_count) values(%s, %s, %s, %s, %s)'
                        try:
                            cur.execute(sql, (book_id, book_name[:len(book_name)-8], initial_author_id, len(current_file_words), len(sentences)))
                            connection.commit()
                        except Exception as e:
                            print("")
                                
                        print("book_id: " + str(book_id))
                        print("book_name: " + book_name)

                        sql = 'insert into public."Sentences" (id, sentence, words_count, book_id) values(%s, %s, %s, %s)'
                        for sentence in sentences:
                            try:
                                words_in_sentence = len(re.findall("[а-яА-Я]{3,}", sentence))
                                cur.execute(sql, (sentence_id, sentence, words_in_sentence, initial_book_id))
                                connection.commit()
                                sentence_id+=1
                            except:
                                print("")

                        sql = 'insert into public."Words" (id, word) values(%s, %s)'
                        for word in current_file_words:
                            try:
                                cur.execute(sql, (word_id, word.lower()))
                                connection.commit()
                                sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                                cur.execute(sql2, (initial_book_id, word_id))
                                word_id+=1
                            except Exception as e:
                                print("")
                                #word_id+=1
                        
                        connection.commit()
                        
                        f.close()
                        connection.commit()
                    except (Exception, psycopg2.DatabaseError) as error:
                        print(error)
                    finally:
                        if connection is not None:
                            connection.close()
                    
                    book_id+=1
            author_id+=1
                        
        print("\n")
        i += 1

if __name__ == '__main__':
    importData()