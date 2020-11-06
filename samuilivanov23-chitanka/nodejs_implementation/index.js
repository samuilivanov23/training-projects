const express = require('express')
const app = express()
const { Client } = require('pg')
const data = require('./db_config')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const { request, response, query } = require('express')
const url = require('url')
const { createBrotliCompress } = require('zlib')
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
            
            let plotData = [x_axis_items, y_axis_items]

            response.render('home', {
                plotData, authors_autocomplete
            })
        }
    })
}

getTop10Books = function (query, parameters, response, author_name)
{
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
            
            let plotData = [x_axis_items, y_axis_items]

            response.render('books-plot', {
                plotData, authors_autocomplete, author_name
            })
        }
    })
}

getTopSentences = function (query, parameters, response, book_name)
{
    client.query(query, parameters, (err, res) => {
        if(err != null)
        {
            console.log(err)
        }
        else
        {                        
            if(res['rows'][0]['count'] == null)
            {
                console.log("Author-Book does not match!")
                getTop10Authors(response)
            }
            else
            {
                sentencesRanges(res['rows'], response, book_name)
            }
        }
    })
}

sentencesRanges = function (resultSentences, response, book_name)
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
        y_axis_items.push(sentences['count'])
    })

    let authors_autocomplete = getAllAuthors()
    
    let plotData = [x_axis_items, y_axis_items]

    response.render('sentences-plot', {
        plotData, authors_autocomplete, book_name
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

getAllBooksFromAuthor = function(author_name, response)
{
    var books_autocomplete = []
    let query = `select b.name from books as b join authors as a on b.author_id=a.id where a.name=$1`
    let parameters = [author_name]

    client.query(query, parameters, (err, res) => {
        if(err != null)
        {
            console.log(err)
        }
        else
        {
            res['rows'].forEach(book => {
                books_autocomplete.push(book["name"])
            })

            let authors = []; //x_data
            let words_count = []; //y_data

            for (let i = 0; i < 3; i++) {
                authors.push({name: i})
                words_count.push({wordsCount: i*10})
            }

            response.contentType('application/json')
            books_from_author = {books: books_autocomplete}
            response.send(books_from_author)
        }
    })

    return books_autocomplete
}

app.get('/', function(request, response) {
    console.log(request)

    getTop10Authors(response)
});

app.get('/plot', function(request, response) {
    console.log(request)

    const queryObject = url.parse(request.url, true).query

    let author_name = queryObject['author']
    let book_name = queryObject['book']
    let query = ""
    let parameters = []

    // let first_start = '0';
    // let first_end = '5';
    // let second_end = '10';
    // let third_end = '15';
    // let fourth_end = '20';
    // let fifth_end = '70';

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

                query = `select id from books where name=$1 and author_id=$2`
                parameters = [book_name, author_id]

                client.query(query, parameters, (err, res) => {
                    if(err != null)
                    {
                        console.log(err)
                    }
                    else
                    {
                        let book_id = res['rows'][0]['id']

                        query =`select '1' as range, count(id) from sentences where book_id=$1 and words_count>=0 and words_count<5
                                union
                                select '2' as range, count(id) from sentences where book_id=$2 and words_count>=5 and words_count<10
                                union
                                select '3' as range, count(id) from sentences where book_id=$3 and words_count>=10 and words_count<15
                                union
                                select '4' as range, count(id) from sentences where book_id=$4 and words_count>=15 and words_count<20
                                union
                                select '5' as range, count(id) from sentences where book_id=$5 and words_count>=20 and words_count<70
                                order by range asc`
            
                        parameters = [book_id, book_id, book_id, book_id, book_id,]

                        getTopSentences(query, parameters, response, book_name)
                    }
                })
            }
        })
    }
    else if (book_name != "")
    {
        query = `select id from books where name=$1`
        parameters = [book_name]

        client.query(query, parameters, (err, res) => {
            if(err != null)
            {
                console.log(err)
            }
            else
            {
                let book_id = res['rows'][0]['id']

                query =`select '1' as range, count(id) from sentences where book_id=$1 and words_count>=0 and words_count<5
                        union
                        select '2' as range, count(id) from sentences where book_id=$2 and words_count>=5 and words_count<10
                        union
                        select '3' as range, count(id) from sentences where book_id=$3 and words_count>=10 and words_count<15
                        union
                        select '4' as range, count(id) from sentences where book_id=$4 and words_count>=15 and words_count<20
                        union
                        select '5' as range, count(id) from sentences where book_id=$5 and words_count>=20 and words_count<70
                        order by range asc`
        
                let parameters = [book_id, book_id, book_id, book_id, book_id]

                getTopSentences(query, parameters, response, book_name)
            }
        })
    }
    else if(author_name != "")
    {
        query = `select b.name, b.words_count from authors as a
        join books as b on a.id=b.author_id
        where a.name=$1 order by b.words_count desc limit 10`

        let parameters = [author_name]

        getTop10Books(query, parameters, response, author_name)
    }
});

app.get('/proccess_author', function(request, response){
    const queryObject = url.parse(request.url, true).query
    getAllBooksFromAuthor(queryObject['author'], response)
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});