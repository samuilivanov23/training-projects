//input parameters
let n = 10;
let a = 2;
let b = 3;
let c = 1;

//canvas parameters
const canvasWidth = 1920;
const canvasHeight = 980;
backgroundColor = 51;

my_line = [];

function setup(){
  createCanvas(canvasWidth, canvasHeight);
  background(backgroundColor);

  drawLine();

  //draw dots
  for(let i = 0; i <= n/a; i++)
  {
    dot_x_position = (i * a * 50) + 100
    dot_y_position = 550;
    drawDot(dot_x_position, dot_y_position, 255, 0, 0)
  }

  end_x_position = (n * 50) + 100;
  for(let i = 0; i <= n/b; i++)
  {
    dot_x_position = end_x_position - (i * b * 50)
    dot_y_position = 530;
    color = 'green'
    drawDot(dot_x_position, dot_y_position, 0, 250, 0)
  }

  n++;
  //add dots to array
  for(let i = 0; i <= n/a; i++)
  {
    my_line[i*a] = 1;
  }

  my_line[n - 1] = 2;
  for(let i = 0; i <= n/b; i++)
  {
    my_line[(n-1) - (i*b)] = 2
  }

  stroke(0, 0, 0);
  strokeWeight(4);
  for(let i = 0; i < n; i++){
    if(i == 0)
    {
      if ((my_line[i] != my_line[i + 1]) && (my_line[i] != null) && (my_line[i + 1] != null))
      {
        start_x_position = (i * 50) + 100;
        end_x_position = ((i+1) * 50) + 100;
        line(start_x_position, 540, end_x_position, 540);
        i++;
        console.log("start position: " + start_x_position);
        console.log("end position: " + end_x_position);
      }
    }
    else if(i == n - 1)
    {
      if ((my_line[i] != my_line[i - 1]) && (my_line[i] != null) && (my_line[i - 1] != null))
      {
        start_x_position = ((i - 1) * 50) + 100;
        end_x_position = (i * 50) + 100;
        line(start_x_position, 540, end_x_position, 540);
      }
    }
    else
    {
      if ((my_line[i] != my_line[i - 1]) && (my_line[i] != null) && (my_line[i - 1] != null))
      {
        start_x_position = ((i - 1) * 50) + 100;
        end_x_position = (i * 50) + 100;

        line(start_x_position, 540, end_x_position, 540);
      }
      if ((my_line[i] != my_line[i + 1]) && (my_line[i] != null) && (my_line[i + 1] != null))
      {
        start_x_position = (i * 50) + 100;
        end_x_position = ((i+1) * 50) + 100;
        line(start_x_position, 540, end_x_position, 540);
        i++;
      }
    }
  }
}

function drawDot(positionX, positionY, r, g, b)
{
  stroke(r, g, b);
  strokeWeight(10);
  point(positionX, positionY);
}

function drawLine()
{
  fill(255,255,255);
  stroke(255);
  strokeWeight(6);
  line(100, 540, (n * 50) + 100, 540)

  stroke(0, 0, 0);
  strokeWeight(4);
  for(let i = 1; i < n; i++)
  {
    x_position = (i * 50) + 100;
    line(x_position, 535, x_position, 545);
  }
}