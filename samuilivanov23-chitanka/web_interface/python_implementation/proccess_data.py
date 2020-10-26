# import urllib.request

# result = urllib.request.urlopen("http://95.42.214.15:1024/").read()
# print(result)

import plotly.graph_objects as go
import psycopg2
from dbconfig import dbname_, dbuser_, dbpassword_
import sys

def getSentencesStats(book, cur):
    sql  = """select '0 - 5 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=%s and s.words_count>=%s and s.words_count<%s group by s.words_count) as a 
                            union
                            select '5 - 10 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=%s and s.words_count>=%s and s.words_count<%s group by s.words_count) as a
                            union
                            select '10 - 15 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=%s and s.words_count>=%s and s.words_count<%s group by s.words_count) as a
                            union
                            select '15 - 20 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=%s and s.words_count>=%s and s.words_count<%s group by s.words_count) as a
                            union
                            select '20 - 70 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=%s and s.words_count>=%s and s.words_count<%s group by s.words_count) as a"""
        
    parameters = [book, 0, 5, book, 5, 10, book, 10, 15, book, 15, 20, book, 20, 70]
    cur.execute(sql, (parameters))
    records = cur.fetchall()
    
    x_axis = []
    y_axis = []

    start = 0
    end = 5
    i = 0 
    j = 0

    while i < len(records):
        j = 0
        while j < len(records):
            if records[j][0] == str(start) + " - " + str(end) + " words":
                x_axis.append(records[j][0])
                y_axis.append(int(records[j][1]))
                start+=5
                end+=5
                break
            j+=1
        i+=1
    
    i = 0
    while i < len(records):
        if records[i][0] == "20 - 70 words":
            x_axis.append(records[i][0])
            y_axis.append(records[i][1])
            break
        i+=1
    
    return x_axis, y_axis

def getAuthorsBooksStats(records, cur):
    x_axis = []
    y_axis = []
    i = 0
    while i < len(records):
        x_axis.append(records[i][0])
        y_axis.append(records[i][1])
        i+=1
    
    return x_axis, y_axis


try:
    connection = psycopg2.connect("dbname='" + dbname_ + "' user='" + dbuser_ + "' password='" + dbpassword_ + "'")
    connection.autocommit = True
    cur = connection.cursor()
except Exception as e:
    print(e)

author = ""
book = ""

try:
    author = sys.argv[1]
    book = sys.argv[2]
except:
    print("author or book not presented")

# print(author)
# print(book)

x_axis = []
y_axis = []

#check if at least author or book is inputted
if (not author == "") or (not book == ""):

    #check if both author and book are inputted
    if (not author == "") and (not book == ""):
        sql ="""select a.name, b.name from authors as a join books as b 
                on a.id=b.author_id where a.name=%s and b.name=%s"""
        
        cur.execute(sql, (author, book))
        records = cur.fetchall()

        if not records:
            print("empty")
        else:
            chart_title = "Sentences count in the specified ranges"
            x_axis, y_axis = getSentencesStats(book, cur)

    #check if only book name is inputted
    elif not book == "":
        chart_title = "Sentences count in the specified ranges"
        x_axis, y_axis = getSentencesStats(book, cur)
    
    #check if only author name is inputed
    elif not author == "":
        chart_title = "Top 10 books with most unique words"

        sql ="""select b.name, b.words_count from authors as a 
                join books as b on a.id=b.author_id 
                where a.name=%s 
                order by b.words_count desc limit 10"""
        
        cur.execute(sql, (author, ))
        records = cur.fetchall()
        x_axis, y_axis = getAuthorsBooksStats(records, cur)

else:
    chart_title = "Top 10 authors with most unique words"

    sql="""select name, words_count from authors 
        order by words_count desc 
        limit 10"""

    cur.execute(sql)
    records = cur.fetchall()
    x_axis, y_axis = getAuthorsBooksStats(records, cur)

if x_axis  and y_axis:
    fig = go.Figure(
        data=[go.Bar(x=x_axis, y=y_axis)],
        layout_title_text= chart_title
    )
    fig.show()