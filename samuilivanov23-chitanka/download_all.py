import os
import re
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import zipfile, glob
from dbconfig import dbpassword_ 
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
                        root_password = dbpassword_
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
                            root_password = dbpassword_
                            for zip_info in zip_infos:
                                zip_info.filename = unzipped_file_name
                                zip_data.extract(zip_info, path=dir_location, pwd=dbpassword_.encode('utf-8'))
                            
                            zip_data.close()

                            print("\n")
                        except:
                            print("FAILED..END")
                    
                    if os.path.isfile("../books/" + author_name + "/" + unzipped_file_name):
                        break
                    
    print("\n")
    i += 1