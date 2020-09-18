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
            include 'db-conf.php';

            $input_author = $_POST['author'];
            $input_book = $_POST['book'];

            $x_axis = array();
            $y_axis = array();
            $output_case = 0;

            if( $input_author != "" || $input_book != "")
            {                
                $dbConnection = new PDO('pgsql:host='. $dbhost_ . ';dbname=' . $dbname_, $dbuser_, $dbpass_) or die("Connection failed");
                
                $dbConnection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $params = array();

                if($input_book != "")
                {                    
                    $output_case = 2;

                    $sentences_rank_list = array();
                    
                    for($i = 0; $i<=20; $i+=5)
                    {
                        $end = $i + 5;
                        $start_words_count = $i;
                        $end_words_count = $end;
                        $sentences_key = $start_words_count . "-" . $end_words_count . " words";
                        $sentences_stats = getSentencesStats($start_words_count, $end_words_count, $input_book, $dbConnection);
                        $sentences_rank_list[$sentences_key] = $sentences_stats;
                    }

                    $start_words_count = '20';
                    $end_words_count = '70';
                    $sentences_key = '20 - 70 words';
                    $sentences_stats = getSentencesStats($start_words_count, $end_words_count, $input_book, $dbConnection);
                    $sentences_rank_list[$sentences_key] = $sentences_stats;

                    $x_axis = array_keys($sentences_rank_list);
                    $y_axis = array_values($sentences_rank_list);
                }
                else if($input_author != "")
                {
                    $output_case = 1;

                    $sql_books_chart = 'select b.name, count(distinct w.word) as word_count from public."Authors" as a 
                                        join public."Books" as b on a.id=b.author_id 
                                        join public."Books_Words" as bw on b.id=bw.book_id 
                                        join public."Words" as w on bw.word_id=w.id 
                                        where a.name=:input_author
                                        group by b.name order by word_count desc 
                                        limit 10';
                    
                    $params["input_author"] = $input_author;
                    
                    $statement = $dbConnection->prepare($sql_books_chart);
                    $statement->execute($params);
                    $books_result = $statement->fetchAll();

                    foreach($books_result as $row)
                    {
                        $x_axis[] = $row["name"];
                        $y_axis[] = $row["word_count"];
                    }
                }
            }
            else
            {
                $output_case = 3;
                // $sql = 'select a.name, count(distinct w.word) as word_count from public."Authors" as a 
                //         join public."Books" as b on a.id=b.author_id 
                //         join public."Books_Words" as bw on b.id=bw.book_id 
                //         join public."Words" as w on bw.word_id=w.id 
                //         group by a.name order by word_count desc 
                //         limit 10';
        
                // $connection_string = "host=" . $dbhost_ . " port=5432 dbname=" . $dbname_ . " user=" . $dbuser_ . " password=" . $dbpass_;
                // $dbConnection = pg_connect($connection_string);

                // $result = pg_query($dbConnection, $sql);
                // if (!$result) {
                //     echo "An error occurred.\n";
                //     exit;
                // }

                // $arr = pg_fetch_all($result);
                // foreach($arr as $row)
                // {
                //     $x_axis[] = $row["name"];
                //     $y_axis[] = $row["word_count"];
                // }
            }


            function getSentencesStats($start_words_count, $end_words_count, $input_book, $dbConnection)
            {
                $sql = 'select sum(sentences_count) from 
                        (select words_count, count(s.sentence) as sentences_count from public."Books" as b 
                        join public."Sentences" as s on b.id=s.book_id 
                        where b.name =:input_book and words_count>=' . $start_words_count . ' 
                        and words_count<' . $end_words_count . ' group by words_count) as a;';

                $params["input_book"] = $input_book;

                $statement = $dbConnection->prepare($sql);
                $statement->execute($params);
                $sentences_result = $statement->fetchColumn();

                return $sentences_result;
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

        <?php if ($output_case == 1 || $output_case == 2) : ?>
            <script type="text/javascript">
                var x_axis =<?php echo json_encode($x_axis); ?>;
                var y_axis =<?php echo json_encode($y_axis); ?>;
                var chart_title = <?php echo json_encode($title); ?>;

                var books_words_chart = {
                    type: 'bar',
                    name: chart_title,
                    x: x_axis,
                    y: y_axis,
                    marker: {
                        color: '#C8A2C8',
                        line: {
                            width: 2.5
                        },
                    }
                };

                var data = [ books_words_chart ];

                var layout = { 
                    title: chart_title,
                    font: {size: 14},
                    height: 700,
                    margin: {
                        b: 300,
                    },    
                };

                var config = {responsive: true}

                Plotly.newPlot('chart', data, layout, config );
            </script>
        <?php endif; ?>

        <?php if ($output_case == 3) : ?>
            <p>Не е извършено филтриране все още.</p>
        <?php endif; ?>
    </body>
</html>