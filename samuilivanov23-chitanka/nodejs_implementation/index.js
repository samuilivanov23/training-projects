const data = require('./db_config');
const { Client } = require('pg');
const express = require('express')
const app = express();
const port = 8000;

app.get('/', (req, res) => {
      res.send('Hello World')
});

app.listen(port, () => {
      console.log(`Example app listening on port ${port}!`)
});

const client = new Client({
    user: data.credentials['dbuser_'],
    host: data.credentials['dbhost_'],
    database: data.credentials['dbname_'],
    password: data.credentials['dbpassword_'],
})
client.connect()


var query = 'select name, words_count from authors order by words_count desc limit 10'
client.query(query, (err, res) => {
    if(err != null)
    {
        console.log(err)
    }
    else
    { 
        res['rows'].forEach(author => {
            console.log(author['name'])
            console.log(author['words_count'])
        })     
    }
})

query = `select b.name, b.words_count from authors as a 
               join books as b on a.id=b.author_id 
               where a.name=$1 order by b.words_count desc limit 10`
var parameters = ['Агата Кристи']

client.query(query, parameters, (err, res) => {
    if(err != null)
    {
        console.log(err)
    }
    else
    { 
        res['rows'].forEach(book => {
            console.log(book['name'])
            console.log(book['words_count'])
        })     
    }
})


query = `select '0 - 5 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
b.id=s.book_id where b.name=$1 and s.words_count>=$2 and s.words_count<$3 group by s.words_count) as a 
union
select '5 - 10 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$4 and s.words_count>=$5 and s.words_count<$6 group by s.words_count) as a
union
select '10 - 15 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$7 and s.words_count>=$8 and s.words_count<$9 group by s.words_count) as a
union
select '15 - 20 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$10 and s.words_count>=$11 and s.words_count<$12 group by s.words_count) as a                                                                   union
select '20 - 70 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=$13 and s.words_count>=$14 and s.words_count<$15 group by s.words_count) as a`

const book_name = 'Подвизите на Еркюл'
parameters = [book_name, '0', '5', book_name, '5', '10', book_name, '10', '15', book_name, '15', '20', book_name, '20', '70']

client.query(query, parameters, (err, res) => {
    if(err != null)
    {
        console.log(err)
    }
    else
    {
        res['rows'].forEach(sentences => {
            console.log(sentences['range'])
            console.log(sentences['sum'])
        })     
    }
    client.end()
})
