//input parameters
let A = 4;

//canvas parameters
const canvasWidth = 1300;
const canvasHeight = 520;
backgroundColor = 51;

//drawing parameters
multiplicationCoefficient = 100;
offsetX = 200;
offsetY = 50;
let i = 0;

function setup(){
  createCanvas(canvasWidth, canvasHeight);
  background(backgroundColor);
  drawSquare();
  frameRate(1);
}

function draw()
{
  if(i <= A)
  {
    dot1_x = 0 + offsetX;
    dot1_y = 0 + offsetY;
    for(let j = 0; j <= A; j++)
    {
      side_a_squared = Math.pow(i, 2);
      side_b_squared = Math.pow(j, 2);
      distance = Math.sqrt(side_a_squared + side_b_squared);
  
      dot2_x = (i * multiplicationCoefficient) + offsetX;
      dot2_y = (j * multiplicationCoefficient) + offsetY;
      if (distance == int(distance) && !(dot1_x == dot2_x || dot1_y == dot2_y))
      {
        drawLine(dot1_x, dot1_y, dot2_x, dot2_y, 6, 255, 0, 0);
      }
      else
      {
        drawLine(dot1_x, dot1_y, dot2_x, dot2_y, 3, 50, 50, 255);
      }
    }
    i++;
  }
}

function drawSquare()
{
  for(let i = 0; i <= A; i++)
  {
    dot1_x = offsetX;
    dot1_y = (i * multiplicationCoefficient) + offsetY;
    dot2_x = (A * multiplicationCoefficient) + offsetX;
    dot2_y = (i * multiplicationCoefficient) + offsetY;
    drawLine(dot1_x, dot1_y, dot2_x, dot2_y, 6, 255, 255, 255)
  }

  for(let i = 0; i <= A; i++)
  {
    dot1_x = (i * multiplicationCoefficient) + offsetX;
    dot1_y = offsetY;
    dot2_x = (i * multiplicationCoefficient) + offsetX;
    dot2_y = (A * multiplicationCoefficient) + offsetY;
    drawLine(dot1_x, dot1_y, dot2_x, dot2_y, 6, 255, 255, 255)
  }

  drawDots();
}

function drawDots()
{
  for(let i = 0; i <= A; i++)
  {
    for(let j = 0; j <= A; j++)
    {
      dot_x = (i * multiplicationCoefficient) + offsetX;
      dot_y = (j * multiplicationCoefficient) + offsetY;
      drawDot(dot_x, dot_y)
    }
  }
}

function drawDot(positionX, positionY)
{
  stroke(0, 200, 0);
  strokeWeight(10);
  point(positionX, positionY);
}

function drawLine(x1 ,y1, x2, y2, strokeWeight_, r, g, b)
{
  stroke(r, g, b);
  strokeWeight(strokeWeight_);
  line(x1, y1,x2, y2)
}