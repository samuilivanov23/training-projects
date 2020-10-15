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

Plotly.newPlot('chart', data, layout, config);