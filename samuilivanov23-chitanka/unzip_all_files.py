import re
import os, zipfile
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import glob

count = 0
starting_index = 6500
my_dirnames = os.listdir("../books")[starting_index:]
files_locations = []

while starting_index < 6561:
    my_author_name = ""
    count = 0
    files_locations = []
    try:
        for my_dir in my_dirnames:
            for my_file in os.listdir("../books/"+my_dir):
                if my_file.endswith(".zip"):
                    file_location = "../books/"+my_dir+"/"+my_file
                    dir_location = "../books/"+my_dir+"/"
                    my_author_name = my_dir
                    print(file_location)
                    zip_file = zipfile.ZipFile(file_location, mode="r")
                    zip_file.extractall(path=dir_location, pwd='samuil123'.encode('utf-8'))
                    zip_file.close()
            count += 1
        if starting_index == 6500:
            print("all files unzipped")
            break
    except:
        starting_index += count
        print("unzipped authors: " + str(starting_index))
        print("author: " + my_author_name)

        my_dirnames = os.listdir("../books")[starting_index:]

        print("Starting to download books from author: '" + my_author_name + "'\n")
        folder_location = "../books/"
        if not os.path.exists(folder_location):os.mkdir(folder_location)

        author_name = my_author_name

        folder_location = "../books/" + author_name

        files = glob.glob(folder_location + "/*")
        for f in files:
            os.remove(f)

        url = "https://chitanka.info/person/" + author_name

        print(url)

        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        print("\nauthor: " + author_name)

        #using regex to match the starting pattern and everything else after that
        for link2 in soup.find_all("a", {'title': re.compile(r'^Сваляне във формат txt.zip')}):
            #Name the files using the last portion of the link

            if link2['href'].split('/')[-2] == "text":
                book_name = link2['href'].split('/')[-1]
                filename = os.path.join(folder_location, book_name)
                print("file name: " + filename)

                if not os.path.exists(folder_location):os.mkdir(folder_location)

                f = open(filename, 'wb')
                f.write(requests.get(urljoin(url,link2['href'])).content)
                f.close()

                file_location = folder_location + "/" + book_name
                dir_location = folder_location + "/"
                print("file location: " + file_location)
                zip_file = zipfile.ZipFile(file_location, mode="r")
                zip_file.extractall(path=dir_location, pwd='samuil123'.encode('utf-8'))
                zip_file.close()
                print("\n")