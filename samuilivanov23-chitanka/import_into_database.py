import psycopg2
from dbconfig import chitanka_dbname, chitanka_dbuser, chitanka_dbpassword
import os
import re, nltk
from pathlib import Path
import requests, os,re
import glob

def importDataByAuthor(author_name_latin, author_name_cyrillic):
    word_id, sentence_id, book_id, author_id = 1, 1, 1, 1

    #connect to the database and import data
    try:
        my_file = os.path.join(folder_location, unzipped_file_name)
        f = open(my_file, encoding='utf-8', mode='r')
        file_content = f.read()
        f.close()

        current_file_words = list(set(re.findall("[а-яА-Я]{3,}", file_content)))
        sentences = nltk.tokenize.sent_tokenize(file_content)

        connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                    "' user='" + chitanka_dbuser + 
                                    "' password='" + chitanka_dbpassword + "'")

        connection.autocommit = True
        cur = connection.cursor()

        initial_author_id = author_id #for the books table
        sql = 'insert into public."Authors" (id, name) values(%s, %s)'
        try:
            cur.execute(sql, (author_id, author_name_cyrillic))
            connection.commit()
        except:
            pass
        
        print("author_id: " + str(author_id))

        initial_book_id = book_id #for the words table
        sql = 'insert into public."Books" (id, name, author_id) values(%s, %s, %s)'
        try:
            cur.execute(sql, (book_id, book_name[:len(book_name)-8], initial_author_id))
            connection.commit()
            book_id+=1
        except:
            pass
                
        print("book_id: " + str(book_id))
        print("book_name: " + book_name)

        sql = 'insert into public."Sentences" (id, sentence, words_count, book_id) values(%s, %s, %s, %s)'
        for sentence in sentences[:len(sentences)-1]:
            try:
                if not sentence == "":
                    words_in_sentence = len(re.findall("[а-яА-Я]{3,}", sentence))
                    cur.execute(sql, (sentence_id, sentence, words_in_sentence, initial_book_id))
                    connection.commit()
                    sentence_id+=1
            except:
                pass

        sql = 'insert into public."Words" (id, word) values(%s, %s)'
        initial_word_id = word_id
        is_word_added = True
        for word in current_file_words:
            try:
                print("here----")
                print(word.lower())   
                cur.execute(sql, (word_id, word.lower()))
                connection.commit()
                print("here----")     
                sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                cur.execute(sql2, (initial_book_id, initial_word_id))
                word_id+=1
            except:
                is_word_added = False
            
            if not is_word_added:
                try:
                    sql2 = 'select id from public."Words" where word=%s'
                    cur.execute(sql2, (word.lower(),))
                    duplicate_word_id = cur.fetchall()[0][0]
                    sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                    cur.execute(sql2, (initial_book_id, duplicate_word_id))
                except:
                    pass
        
        connection.commit()
        
        f.close()
        connection.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if connection is not None:
            connection.close()

def importData():
    word_id, sentence_id, book_id, author_id = 1, 1, 1, 1

    my_dirs = glob.glob("../books/*")
    my_dirs.sort()
    
    for my_dir in my_dirs:
        author_name = re.sub("\-", " ", my_dir[9:])
        print(author_name)
        folder_location = "../books/" + my_dir[9:]
        for my_file in os.listdir("../books/"+my_dir[9:]):
            if my_file.endswith(".txt"):
                names = my_file.split("-")
                book_name = ""
                for name in names[1:]:
                    book_name += name + " "
                book_name.strip()
                book_name = book_name[:len(book_name) - 5]
                print(book_name)

                #connect to the database and import data
                try:
                    my_file = os.path.join(folder_location, my_file)
                    f = open(my_file, encoding='utf-8', mode='r')
                    file_content = f.read()
                    f.close()

                    current_file_words = list(set(re.findall("[а-яА-Я]{3,}", file_content)))
                    sentences = nltk.tokenize.sent_tokenize(file_content)

                    connection = psycopg2.connect("dbname='" + chitanka_dbname + 
                                                "' user='" + chitanka_dbuser + 
                                                "' password='" + chitanka_dbpassword + "'")

                    connection.autocommit = True
                    cur = connection.cursor()

                    initial_author_id = author_id #for the books table
                    sql = 'insert into public."Authors" (id, name) values(%s, %s)'
                    try:
                        cur.execute(sql, (author_id, author_name))
                        connection.commit()
                    except:
                        pass
                    
                    print("author_id: " + str(author_id))

                    initial_book_id = book_id #for the words table
                    sql = 'insert into public."Books" (id, name, author_id) values(%s, %s, %s)'
                    try:
                        cur.execute(sql, (book_id, book_name, initial_author_id))
                        connection.commit()
                    except:
                        pass
                            
                    print("book_id: " + str(book_id))
                    print("book_name: " + book_name)

                    sql = 'insert into public."Sentences" (id, sentence, words_count, book_id) values(%s, %s, %s, %s)'
                    for sentence in sentences[:len(sentences)-1]:
                        try:
                            if not sentence == "":
                                words_in_sentence = len(re.findall("[а-яА-Я]{3,}", sentence))
                                cur.execute(sql, (sentence_id, sentence, words_in_sentence, initial_book_id))
                                connection.commit()
                                sentence_id+=1
                        except:
                            pass

                    sql = 'insert into public."Words" (id, word) values(%s, %s)'
                    initial_word_id = word_id
                    is_word_added = True
                    for word in current_file_words:
                        try:
                            print("here----")
                            print(word.lower())   
                            cur.execute(sql, (word_id, word.lower()))
                            connection.commit()    
                            sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                            cur.execute(sql2, (initial_book_id, word_id))
                            word_id+=1
                            is_word_added = True
                        except:
                            is_word_added = False
                        
                        if not is_word_added:
                            try:
                                sql2 = 'select id from public."Words" where word=%s'
                                cur.execute(sql2, (word.lower(),))
                                duplicate_word_id = cur.fetchall()[0][0]
                                sql2 = 'insert into public."Books_Words" (book_id, word_id) values(%s, %s)'
                                cur.execute(sql2, (initial_book_id, duplicate_word_id))
                            except:
                                pass
                                            
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

if __name__ == '__main__':
    importData()
    #importDataByAuthor("dimityr-talev", "Димитър-Талев")