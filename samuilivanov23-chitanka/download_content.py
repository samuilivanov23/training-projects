import multiprocessing
import os
import re
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import zipfile, glob
from dbconfig import dbpassword_

def downloadAll(start_index, end_index):
    start = start_index
    end = end_index

    while start <= end:
        url = "https://chitanka.info/authors/first-name/-.html/" + str(start)

        print("page: " + str(start))
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
                        book_chitanka_id = re.findall('([0-9])', book_name)
                        book_chitanka_id = ''.join(book_chitanka_id)
                        
                        parent_tag = book_link.parent.parent.parent.parent
                        cyrillic_book_name = parent_tag.find("a", itemprop="name").find("i").get_text()
                        cyrillic_book_name = book_chitanka_id + "-" + re.sub('\s+', '-', cyrillic_book_name)
                        cyrillic_book_name = cyrillic_book_name + ".txt.zip"

                        filename = os.path.join(folder_location, cyrillic_book_name)
                        print(filename)
                        print("index: " + str(start))

                        if not os.path.exists(folder_location):os.mkdir(folder_location)

                        f = open(filename, 'wb')
                        f.write(requests.get(urljoin(url,book_link['href'])).content)
                        f.close()

                        file_location = folder_location + "/" + cyrillic_book_name
                        dir_location = folder_location + "/"

                        zip_data = zipfile.ZipFile(file_location, mode="r")
                        zip_infos = zip_data.infolist()

                        unzipped_file_name = cyrillic_book_name[:(len(cyrillic_book_name)-4)] #to skip the last four characters which are ".zip"
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
                            print("index: " + str(start))

                            if not os.path.exists(folder_location):os.mkdir(folder_location)

                            f = open(filename, 'wb')
                            f.write(requests.get(urljoin(url,book_link['href'])).content)
                            f.close()

                            file_location = folder_location + "/" + cyrillic_book_name
                            dir_location = folder_location + "/"

                            zip_data = zipfile.ZipFile(file_location, mode="r")
                            zip_infos = zip_data.infolist()

                            unzipped_file_name = cyrillic_book_name[:(len(cyrillic_book_name)-4)] #to skip the last four characters which are ".zip"
                            root_password = dbpassword_
                            for zip_info in zip_infos:
                                zip_info.filename = unzipped_file_name
                                zip_data.extract(zip_info, path=dir_location, pwd=dbpassword_.encode('utf-8'))
                            
                            zip_data.close()

                            print("\n")
                        except:
                            print("FAILED..END")
                        
        print("\n")
        start += 1

if __name__ == '__main__':
    repetition_count = 3
    start = 36
    end = 36

    p1 = multiprocessing.Process(target=downloadAll, args=(start, end,))
    
    p2 = multiprocessing.Process(target=downloadAll, args=(start+1, end+1,))
    
    p3= multiprocessing.Process(target=downloadAll, args=(start+2, end+2,))
    
    p4 = multiprocessing.Process(target=downloadAll, args=(start+3, end+3,))
    
    p5 = multiprocessing.Process(target=downloadAll, args=(start+4, end+4, ))

    p6 = multiprocessing.Process(target=downloadAll, args=(start+5, end+5, ))

    p1.start()
    p2.start()
    p3.start()
    p4.start()
    p5.start()
    p6.start()