<!DOCTYPE html>
<html>
    <head>
        <title>Postgre interface</title>
        <link rel="stylesheet" type="text/css" href="style.css">
        <meta charset="utf-8">
        <link rel="shortcut icon" href="#" />
    </head>

    <body>
        <?php
            include 'db-conf.php';

            $input_author = $_POST['author'];
            $input_book = $_POST['book'];
            $input_word = $_POST['word'];

            $author_words_count;
            $author_longest_sentence;
            $book_words_count;
            $book_longest_sentence;
            $word_in_books_occurs;
            $output_case = 0;

            if( $input_author != "" || $input_book != "" || $input_word != "")
            {                
                $dbConnection = new PDO('pgsql:host='. $dbhost_ . ';dbname=' . $dbname_, $dbuser_, $dbpass_) or die("Connection failed");
                
                $dbConnection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $params = array();

                if($input_word != "")
                {
                    $output_case = 3;

                    $word_occurs_query = 'select distinct a.name as author_name, b.name as book_name from public."Authors" as a 
                                          join public."Books" as b on a.id=b.author_id 
                                          join public."Books_Words" as bw on b.id=bw.book_id 
                                          join public."Words" as w on bw.word_id=w.id 
                                          where w.word=:input_word order by a.name asc;';

                    $params["input_word"] = $input_word;
                    
                    //get words occurrances
                    $statement = $dbConnection->prepare($word_occurs_query);
                    $statement->execute($params);
                    $result = $statement->fetchAll();

                    if(count($result) <= 0)
                    {
                        echo "<p>The input data is not matching any records</p><br>";
                    }
                    
                }
                else if($input_book != "")
                {                    
                    $output_case = 2;

                    $book_words_count_query = 'select count(distinct w.word) from public."Books" as b
                                               join public."Books_Words" as bw on b.id=bw.book_id
                                               join public."Words" as w on bw.word_id=w.id where b.name=:input_book';
                    
                    $book_longest_sentence_query = 'select max(s.words_count) from public."Books" as b
                                                    join public."Sentences" as s on b.id=s.book_id
                                                    where b.name=:input_book';
                    
                    $params["input_book"] = $input_book;

                    //get book's unique words count
                    $result = $dbConnection->prepare($book_words_count_query); 
                    $result->execute($params); 
                    $book_words_count = $result->fetchColumn();

                    //get book's longest sentence
                    $result = $dbConnection->prepare($book_longest_sentence_query); 
                    $result->execute($params); 
                    $book_longest_sentence = $result->fetchColumn(); 
                }
                else if($input_author != "")
                {
                    $output_case = 1;

                    $author_words_count_query = 'select count(distinct w.word) from public."Authors" as a 
                                                join public."Books" as b on a.id=b.author_id
                                                join public."Books_Words" as bw on b.id=bw.book_id
                                                join public."Words" as w on bw.word_id=w.id where a.name=:input_author';
                    
                    $author_longest_sentence_query = 'select max(s.words_count) from public."Authors" as a 
                                                    join public."Books" as b on a.id=b.author_id
                                                    join public."Sentences" as s on b.id=s.book_id
                                                    where a.name=:input_author';

                    $author_books_query = 'select a.name as author_name, b.name as book_name from public."Authors" as a
                                        join public."Books" as b on a.id=b.author_id
                                        where a.name=:input_author';
                    
                    $params["input_author"] = $input_author;


                    //get author's unique words count
                    $result = $dbConnection->prepare($author_words_count_query); 
                    $result->execute($params); 
                    $author_words_count = $result->fetchColumn();

                    //get author's longest sentence
                    $result = $dbConnection->prepare($author_longest_sentence_query); 
                    $result->execute($params); 
                    $author_longest_sentence = $result->fetchColumn(); 

                    //get all author's books
                    $statement = $dbConnection->prepare($author_books_query);
                    $statement->execute($params);
                    $result = $statement->fetchAll();

                    if(count($result) <= 0)
                    {
                        echo "<p>The input data is not matching any records</p><br>";
                    }
                }
            }
            else
            {
                $output_case = 4;
            }

            echo "<p> " . $output_case . " </p>";
        ?>

        <form name="Form" class="margin_style" action="" method="post" accept-charset="UTF-8">
            <div style="width:300px">
                <label for="author">Author</label><br>
                <input type="text" id="author" name="author"
                            value="<?php if (isset($_POST["author"])) echo $_POST["author"]; ?>"><br><br>
            </div>

            <div style="width:300px">
                <label for="book">Book</label><br>
                <input type="text" id="book" name="book"
                            value="<?php if (isset($_POST["book"])) echo $_POST["book"]; ?>"><br><br>
            </div>

            <div style="width:300px">
                <label for="word">Word</label><br>
                <input type="text" id="word" name="word"
                            value="<?php if (isset($_POST["word"])) echo $_POST["word"]; ?>"><br><br>
            </div>

            <input class="button button_style" type="submit" value="Submit" name="Submit"> <br><br>
        </form>

        <?php if($output_case == 1) : ?>
            <p> Брой уникални думи в творчеството му: <?php echo htmlspecialchars($author_words_count) ?></p>
            <p> Най-дългото му изречение е с <?php echo htmlspecialchars($author_longest_sentence) ?> думи</p>

            <table id="customers">
                <thead>
                    <tr>
                        <th>Име на автор</th>
                        <th>Име на книга</th>
                    </tr>
                </thead>
                <tbody> 
                    <?php foreach($result as $row) : ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row["author_name"]) ?></td>
                            <td><?php echo htmlspecialchars($row["book_name"]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>

        <?php if($output_case == 2) : ?>
            <p> Брой уникални думи в книгата: : <?php echo htmlspecialchars($book_words_count) ?></p>
            <p> Най-дългото изречение в книгата е с <?php echo htmlspecialchars($book_longest_sentence) ?> думи</p>
        <?php endif; ?>

        <?php if($output_case == 3) : ?>
            <table id="customers">
                <thead>
                    <tr>
                        <th>Име на автор</th>
                        <th>Име на книга</th>
                    </tr>
                </thead>
                <tbody> 
                    <?php foreach($result as $row) : ?>
                        <tr>
                            <td><?php echo htmlspecialchars($row["author_name"]) ?></td>
                            <td><?php echo htmlspecialchars($row["book_name"]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>

        <?php if ($output_case == 4) : ?>
            <p>Не е извършено филтриране все още.</p>
        <?php endif; ?>              
    </body>
</html>