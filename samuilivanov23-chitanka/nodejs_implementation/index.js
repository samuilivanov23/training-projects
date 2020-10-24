const express = require('express')
const app = express();
const { Client } = require('pg');
const data = require('./db_config');
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser');
const { request, response, query } = require('express');
const port = 8000;

//set main.handlebars as the main template
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

//use the public directory for external scripts
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//set the database client's credentials
const client = new Client({
    user: data.credentials['dbuser_'],
    host: data.credentials['dbhost_'],
    database: data.credentials['dbname_'],
    password: data.credentials['dbpassword_'],
})
client.connect()

getTop10Authors = function (response)
{
    var query = 'select name, words_count from authors order by words_count desc limit 10'
    client.query(query, (err, res) => {
        if(err != null)
        {
            console.log(err)
        }
        else
        {
            let x_axis_items = []
            let y_axis_items = []

            res['rows'].forEach(book => {
                x_axis_items.push(book['name'])
                y_axis_items.push(book['words_count'])
            })

            let authors_autocomplete = getAllAuthors()
            let books_autocomplete = getAllBooks()
            
            let plotData = [x_axis_items, y_axis_items]

            response.render('home', {
                plotData, authors_autocomplete, books_autocomplete
            })
        }
    })
}

sentencesRanges = function (resultSentences, response)
{
    let x_axis_items = []
    let y_axis_items = []

    let ranges_map = {
        "1": "0 - 5 words",
        "2": "5 - 10 words",
        "3": "10 - 15 words",
        "4": "15 - 20 words",
        "5": "20 - 70 words"
    }

    resultSentences.forEach(sentences => {
        x_axis_items.push(ranges_map[sentences['range']])
        y_axis_items.push(sentences['sum'])
    })

    let authors_autocomplete = getAllAuthors()
    let books_autocomplete = getAllBooks()
    
    let plotData = [x_axis_items, y_axis_items]

    response.render('sentences-plot', {
        plotData, authors_autocomplete, books_autocomplete
    })
}

getAllAuthors = function()
{
    var authors_autocomplete = []
    let query = `select name from authors`
    client.query(query, (err, res) => {
        if(err != null)
        {
            console.log(err)
        }
        else
        {
            res['rows'].forEach(author => {
                authors_autocomplete.push(author["name"])
            })
        }
    })

    return authors_autocomplete
}

getAllBooks = function()
{
    var books_autocomplete = []
    let query = `select name from books`
    client.query(query, (err, res) => {
        if(err != null)
        {
            console.log(err)
        }
        else
        {
            res['rows'].forEach(book => {
                books_autocomplete.push(book["name"])
            })
        }
    })

    return books_autocomplete
}

app.get('/', function(request, response) {
    getTop10Authors(response)
});

app.post('/plot', function(request, response) {
    let author_name = request.body.author
    let book_name = request.body.book
    let query = ""
    let parameters = []

    let first_start = '0';
    let first_end = '5';
    let second_end = '10';
    let third_end = '15';
    let fourth_end = '20';
    let fifth_end = '70';

    if(author_name != "" && book_name != "")
    {
        query = `select id from authors where name=$1`
        parameters = [author_name]

        client.query(query, parameters, (err, res) => {
            if(err != null)
            {
                console.log(err)
            }
            else
            {
                let author_id = res['rows'][0]['id']

                query =`select '1' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
                        b.id=s.book_id where b.author_id=$1 and b.name=$2 and s.words_count>=$3 and s.words_count<$4 group by s.words_count) as a 
                        union
                        select '2' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.author_id=$5 and b.name=$6 and s.words_count>=$7 and s.words_count<$8 group by s.words_count) as a
                        union
                        select '3' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.author_id=$9 and b.name=$10 and s.words_count>=$11 and s.words_count<$12 group by s.words_count) as a
                        union
                        select '4' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.author_id=$13 and b.name=$14 and s.words_count>=$15 and s.words_count<$16 group by s.words_count) as a                                                                   
                        union
                        select '5' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.author_id=$17 and b.name=$18 and s.words_count>=$19 and s.words_count<$20 group by s.words_count) as a
                        order by range asc`
            
                parameters = [author_id, book_name, first_start, first_end, 
                              author_id, book_name, first_end, second_end, 
                              author_id, book_name, second_end, third_end, 
                              author_id, book_name, third_end, fourth_end, 
                              author_id, book_name, fourth_end, fifth_end]
            
                client.query(query, parameters, (err, res) => {
                    if(err != null)
                    {
                        console.log(err)
                    }
                    else
                    {                        
                        if(res['rows'][0]['sum'] == null)
                        {
                            console.log("Author-Book does not match!")
                            getTop10Authors(response)
                        }
                        else
                        {
                            sentencesRanges(res['rows'], response)
                        }
                    }
                })          
            }
        })
    }
    else if (book_name != "")
    {
        query = `select '1' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
            b.id=s.book_id where b.name=$1 and s.words_count>=$2 and s.words_count<$3 group by s.words_count) as a 
            union
            select '2' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$4 and s.words_count>=$5 and s.words_count<$6 group by s.words_count) as a
            union
            select '3' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$7 and s.words_count>=$8 and s.words_count<$9 group by s.words_count) as a
            union
            select '4' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$10 and s.words_count>=$11 and s.words_count<$12 group by s.words_count) as a                                                                   
            union
            select '5' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$13 and s.words_count>=$14 and s.words_count<$15 group by s.words_count) as a
            order by range asc`
    
        let parameters = [book_name, first_start, first_end, 
                          book_name, first_end, second_end, 
                          book_name, second_end, third_end, 
                          book_name, third_end, fourth_end, 
                          book_name, fourth_end, fifth_end]
    
        client.query(query, parameters, (err, res) => {
            if(err != null)
            {
                console.log(err)
            }
            else
            {
                sentencesRanges(res['rows'], response)
            }
        })   
    }
    else if(author_name != "")
    {
        query = `select b.name, b.words_count from authors as a 
        join books as b on a.id=b.author_id 
        where a.name=$1 order by b.words_count desc limit 10`

        let parameters = [author_name]
        client.query(query, parameters, (err, res) => {
            if(err != null)
            {
                console.log(err)
            }
            else
            {
                let x_axis_items = []
                let y_axis_items = []

                res['rows'].forEach(book => {
                    x_axis_items.push(book['name'])
                    y_axis_items.push(book['words_count'])
                })
                
                let authors_autocomplete = getAllAuthors()
                let books_autocomplete = getAllBooks()
                
                let plotData = [x_axis_items, y_axis_items]

                response.render('books-plot', {
                    plotData, authors_autocomplete, books_autocomplete
                })
            }
        })
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});