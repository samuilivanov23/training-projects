import psycopg2, multiprocessing
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword
import os
import re, nltk
from pathlib import Path
import requests, os,re
import glob

def importData(start, end):
    my_dirs = glob.glob("../books/*")
    my_dirs.sort()

    for my_dir in my_dirs[start:end]:
        author_name = re.sub("\-", " ", my_dir[9:])

        try:
            connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                        "' user='" + chitanka_dbuser + 
                                        "' password='" + chitanka_dbpassword + "'")

            connection.autocommit = True
            cur = connection.cursor()
        except Exception as e:
            print(e)

        try:
            sql = 'insert into public."Authors" (name) values(%s) RETURNING id'
            cur.execute(sql, (author_name, ))
            author_id = cur.fetchone()[0]
            connection.commit()
            cur.close()
            connection.close()
        except Exception as e:
            print(e)

        folder_location = "../books/" + my_dir[9:]
        my_files = os.listdir("../books/" + my_dir[9:])

        for my_file in my_files:
            if my_file.endswith(".txt"):
                names = my_file.split("-")
                book_name = ""
                for name in names[1:]:
                    book_name += name + " "
                book_name.strip()
                book_name = book_name[:len(book_name) - 5]
                print(book_name)

                file_location = os.path.join(folder_location, my_file)
                f = open(file_location, encoding='utf-8', mode='r')
                file_content = f.read()
                f.close()

                current_file_words = list(set(re.findall("[а-яА-Я]{3,}", file_content)))
                sentences = nltk.tokenize.sent_tokenize(file_content)
                try:
                    connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                                "' user='" + chitanka_dbuser + 
                                                "' password='" + chitanka_dbpassword + "'")

                    connection.autocommit = True
                    cur = connection.cursor()

                    try:
                        sql = 'insert into public."Books" (name, author_id) values(%s, %s) RETURNING id'
                        cur.execute(sql, (book_name, author_id))
                        book_id = cur.fetchone()[0]
                    except Exception as e:
                        print(e)

                    try:
                        for  sentence in sentences[:len(sentences)-1]:
                            if not sentence == "":
                                words_in_sentence = len(re.findall("[а-яА-Я]{3,}", sentence))
                                sql = 'insert into public."Sentences" (sentence, words_count, book_id) values(%s, %s, %s)'
                                cur.execute(sql, (sentence, words_in_sentence, book_id))
                    except Exception as e:
                        print(e)

                    
                    for word in current_file_words:
                        try:
                            sql = 'insert into public."Words" (word) values(%s) RETURNING id'
                            cur.execute(sql, (word.lower(),))
                            word_id = cur.fetchone()[0]
                            
                            sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                            cur.execute(sql2, (book_id, word_id))
                            print("here")
                            connection.commit()
                        except Exception as e:
                            print("here---")
                            try:
                                sql2 = 'select id from public."Words" where word=%s'
                                cur.execute(sql2, (word.lower(),))
                                duplicate_word_id = cur.fetchone()[0]
                                sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                                cur.execute(sql2, (book_id, duplicate_word_id))
                            except Exception as ex:
                                print("here?????")
                                print(ex)
                            print(e)
                                                         
                    connection.commit()
                    cur.close()
                except (Exception, psycopg2.DatabaseError) as error:
                    print(error)
                finally:
                    if connection is not None:
                        connection.close()
    
    print("start: " + str(start))
    print("end: " + str(end))

if __name__ == '__main__':
    start = 1133
    end = 1134

    for i in range(10):
        p1 = multiprocessing.Process(target=importData, args=(start, end))
            
        p2 = multiprocessing.Process(target=importData, args=(start + 1, end+1))

        p3 = multiprocessing.Process(target=importData, args=(start + 2, end+2))
        
        p4 = multiprocessing.Process(target=importData, args=(start + 3, end+3))
        
        p5 = multiprocessing.Process(target=importData, args=(start + 4, end+4))

        p6 = multiprocessing.Process(target=importData, args=(start + 5, end + 5))
        
        p7 = multiprocessing.Process(target=importData, args=(start + 6, end+6))

        p8 = multiprocessing.Process(target=importData, args=(start + 7, end+7))
        
        p9 = multiprocessing.Process(target=importData, args=(start + 8, end + 8))

        p10 = multiprocessing.Process(target=importData, args=(start + 9, end + 9))

        p1.start() 
        p2.start() 
        p3.start() 
        p4.start() 
        p5.start() 
        p6.start() 
        p7.start() 
        p8.start() 
        p9.start() 
        p10.start()

        start += 10
        end += 10