from shutil import move
from pathlib import Path
import requests, os,re
from urllib.parse import urljoin
from bs4 import BeautifulSoup

my_dirnames = os.listdir("../books")

cyrillic_name = ""
cyrillic_country = ""
new_dir_name = ""

base_path = Path("../books")

count = 0
for my_dir in base_path.iterdir():
    try:
        #[9:0] to skip the ../books/ part of the path and extranc only the name of the author as string
        author_name = str(my_dir)[9:]
        url = "https://chitanka.info/person/" + author_name

        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")

        ###get author name in cyrillic
        tag_with_name = soup.find("h1")
        author_name_whitecpace = tag_with_name.get_text().strip()
        cyrillic_name = re.sub('\s+', '-', author_name_whitecpace)

        new_dir_name = cyrillic_name

        ###get author coutnry in cyrillic
        my_tr_tags = soup.find_all("tr")
        test_count = 0
        index = 0
        while test_count < len(my_tr_tags):
            for th in my_tr_tags[test_count].find_all("th"):
                if th.contents[0] == "\nНационалност":
                    index = test_count
                    break
            test_count+=1
        
        my_tag_with_country = my_tr_tags[index].find("td").find_all("a")

        #extract the usefull information in the <a> tag that contains the country
        cyrillic_country = my_tag_with_country[1].contents[0]
        
        new_dir_name = cyrillic_country + "_" + new_dir_name
    except:
        print("No biography info in the page")
    
    print(my_dir)
    print(new_dir_name)
    print(count)
    try:
        new_dir = my_dir.parent / new_dir_name
        move(my_dir, new_dir)
        count+=1
    except:
        print("Unable to change directory name")