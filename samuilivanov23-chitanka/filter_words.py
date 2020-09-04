import psycopg2
from dbconfig import dbname_, dbuser_, dbpassword_
from sys import argv

def filterWords(words_to_filter, filter_suffix):
    suffix_list = ["л","ла", "ло", "ли", "х", "ше", "хме", "хте", "ха", "м", "ш", "а", "ме", "те", "ат", "и", "щ", "ща", "що", "щи"]
    suffix_length = len(filter_suffix) - 1

    for word in words_to_filter:      
        if word[:len(word) - suffix_length] in all_words_list:
            print(word)
            print("here --------")
            print(word[:len(word) - suffix_length])
            sql = 'delete from public."chitanka_words"' + " where word = '" + word + "'"
            cur.execute(sql)
        else:
            for suffix in suffix_list:
                if not suffix == filter_suffix[1:]:
                    new_word = word[:len(word) - suffix_length] + suffix
                    if new_word in all_words_list:
                        print(word)
                        print("here **********")
                        print(new_word)
                        sql = 'delete from public."chitanka_words"' + " where word = '" + new_word + "'"
                        cur.execute(sql)

if __name__ == "__main__":
    #connect to the database
    connection = psycopg2.connect("dbname='" + dbname_ + "' user='" + dbuser_ + "' password='" + dbpassword_ + "'")
    connection.autocommit = True
    cur = connection.cursor()

    #take words to filter
    filter_suffix = argv[1] #this is the argument passed when invoking the script
    sql = 'select * from public."chitanka_words" where word like %s order by word asc'
    cur.execute(sql, (filter_suffix,))
    records = cur.fetchall()
    words_to_filter = [row[1] for row in records]

    #take all words from the database
    sql = 'select * from public."chitanka_words" order by word asc'
    cur.execute(sql)
    records = cur.fetchall()
    all_words_list = [row[1] for row in records]

    #func_to_execute = argv[2]
    filterWords(words_to_filter, filter_suffix)

    cur.close()
    connection.close()