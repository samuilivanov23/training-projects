const express = require('express')
const app = express();
const { Client } = require('pg');
const data = require('./db_config');
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser');
const { request, response } = require('express');
const port = 8000;

app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const client = new Client({
    user: data.credentials['dbuser_'],
    host: data.credentials['dbhost_'],
    database: data.credentials['dbname_'],
    password: data.credentials['dbpassword_'],
})
client.connect()

app.get('/', function(request, response) {
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
            
            let plotData = [x_axis_items, y_axis_items]

            response.render('home', {
                plotData
            })  
        }
    })
});

app.post('/author', function(request, response) {
    let author_name = request.body.author

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
            
            let plotData = [x_axis_items, y_axis_items]

            response.render('books-plot', {
                plotData
            })
        }
    })
});

app.post('/book', function(request, response) {
    let book_name = request.body.book

    query = `select '0 - 5 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
        b.id=s.book_id where b.name=$1 and s.words_count>=$2 and s.words_count<$3 group by s.words_count) as a 
        union
        select '5 - 10 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$4 and s.words_count>=$5 and s.words_count<$6 group by s.words_count) as a
        union
        select '10 - 15 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$7 and s.words_count>=$8 and s.words_count<$9 group by s.words_count) as a
        union
        select '15 - 20 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$10 and s.words_count>=$11 and s.words_count<$12 group by s.words_count) as a                                                                   
        union
        select '20 - 70 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$13 and s.words_count>=$14 and s.words_count<$15 group by s.words_count) as a`    
    
    let first_start = '0';
    let first_end = '5';
    let second_end = '10';
    let third_end = '15';
    let fourth_end = '20';
    let fifth_end = '70';

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
            let x_axis_items = []
            let y_axis_items = []

            res['rows'].forEach(sentences => {
                x_axis_items.push(sentences['range'])
                y_axis_items.push(sentences['sum'])
            })
            
            let plotData = [x_axis_items, y_axis_items]

            response.render('sentences-plot', {
                plotData
            })
        }
    })
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});