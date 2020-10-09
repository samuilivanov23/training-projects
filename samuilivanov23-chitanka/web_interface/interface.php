<!DOCTYPE html>
<html>
    <head>
        <title>Postgre interface</title>
        <link rel="stylesheet" type="text/css" href="style.css">
        <meta charset="utf-8">
        <script src='https://cdn.plot.ly/plotly-latest.min.js'></script>
        <link rel="shortcut icon" href="#" />
    </head>

    <body>
        <?php
            include 'db_conf.php';
            
            $input_author = $_POST['author'];
            $input_book = $_POST['book'];

            $x_axis = array();
            $y_axis = array();
            $char_title = "";
            $output_case = 0;

            if( $input_author != "" || $input_book != "")
            {                
                $dbConnection = new PDO('pgsql:host='. $dbhost_ . ';dbname=' . $dbname_, $dbuser_, $dbpass_) or die("Connection failed");
                
                $dbConnection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $params = array();

                if($input_book != "")
                {
                    $chart_title = "Sentences count in the specified ranges";
                    $output_case = 2;
                    
                    $sentences_rank_list = array();

                    $first_select_range = 0; // 0 ~ 5
                    $second_select_range = 5; // 5 ~ 10
                    $third_select_range = 10; // 10 ~ 15
                    $fourth_select_range = 15; // 15 ~ 20
                    $fifth_select_range = 20; // 20 ~ 70

                    $sql_sentences_chart = "select '0 - 5 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=:input_book and s.words_count>=:first_start and s.words_count<:first_end group by s.words_count) as a 
                            union
                            select '5 - 10 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=:input_book and s.words_count>=:first_end and s.words_count<:second_end group by s.words_count) as a
                            union
                            select '10 - 15 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=:input_book and s.words_count>=:second_end and s.words_count<:third_end group by s.words_count) as a
                            union
                            select '15 - 20 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=:input_book and s.words_count>=:third_end and s.words_count<:fourth_end group by s.words_count) as a
                            union
                            select '20 - 70 words' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=:input_book and s.words_count>=:fourth_end and s.words_count<:fifth_end group by s.words_count) as a";

                    $params["input_book"] = $input_book;
                    $params["first_start"] = $first_select_range;
                    $params["first_end"] = $first_select_range + 5;
                    $params["second_end"] = $second_select_range + 5;
                    $params["third_end"] = $third_select_range + 5;
                    $params["fourth_end"] = $fourth_select_range + 5;
                    $params["fifth_end"] = $fifth_select_range + 50;

                    $statement = $dbConnection->prepare($sql_sentences_chart);
                    $statement->execute($params);
                    $sentences_result = $statement->fetchAll();

                    $start = 0;
                    $end = 5;

                    for($i = 0; $i < 5; $i++)
                    {
                        for($j = 0; $j < 5; $j++)
                        {
                            if($sentences_result[$j]["range"] == $start . " - " . $end . " words")
                            {
                                $x_axis[] = $sentences_result[$j]["range"];
                                $y_axis[] = $sentences_result[$j]["sum"];
                                
                                $start+=5;
                                $end+=5;
                                break;
                            }
                        }
                    }

                    for($i = 0; $i < 5; $i++)
                    {
                        if($sentences_result[$i]["range"] = "20 - 70 words")
                        {
                            $x_axis[] = $sentences_result[$i]["range"];
                            $y_axis[] = $sentences_result[$i]["sum"];
                            break;
                        }
                    }
                }
                else if($input_author != "")
                {
                    $chart_title = "Top 10 books with most unique words";
                    $output_case = 1;

                    $sql_books_chart = 'select b.name, b.words_count from authors as a 
                                        join books as b on a.id=b.author_id 
                                        where a.name=:input_author 
                                        order by b.words_count desc limit 10';
                    
                    $params["input_author"] = $input_author;
                    
                    $statement = $dbConnection->prepare($sql_books_chart);
                    $statement->execute($params);
                    $books_result = $statement->fetchAll();

                    foreach($books_result as $row)
                    {
                        $x_axis[] = $row["name"];
                        $y_axis[] = $row["words_count"];
                    }
                }
            }
            else
            {
                $chart_title = "Top 10 authors with most unique words";
                $output_case = 3;
                $sql = 'select name, words_count from authors 
                        order by words_count desc 
                        limit 10';

                $connection_string = "host=" . $dbhost_ . " port=5432 dbname=" . $dbname_ . " user=" . $dbuser_ . " password=" . $dbpass_;
                $dbConnection = pg_connect($connection_string);

                $result = pg_query($dbConnection, $sql);
                if (!$result) {
                    echo "An error occurred.\n";
                    exit;
                }

                $arr = pg_fetch_all($result);
                foreach($arr as $row)
                {
                    $x_axis[] = $row["name"];
                    $y_axis[] = $row["words_count"];
                }
            }
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

            <input class="button button_style" type="submit" value="Submit" name="Submit"> <br><br>
        </form>

        <div id="chart">
        </div>

        <script type="text/javascript">
            var x_axis = <?php echo json_encode($x_axis); ?>;
            var y_axis = <?php echo json_encode($y_axis); ?>;
            var chart_title = <?php echo json_encode($chart_title); ?>;    
        </script>

        <script type="text/javascript" src="plot.js"></script>
    </body>
</html>