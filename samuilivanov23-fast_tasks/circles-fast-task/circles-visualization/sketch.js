//input parameters
let n = 9;
let x_points = [0, 3, 6, -7, 4, 8, 9, 19, 25];
let y_points = [0, 0, 0, 6, 6, 7, 0, 8, 4];
let radiuses = [2, 2, 2, 5, 2, 5, 8, 7, 2];
let circlesGraph = {};

//canvas parameters
const canvasWidth = 1380;
const canvasHeight = 620;
backgroundColor = 51;

//drawing parameters
multiplicationCoefficient = 20;
offsetX = 500;
offsetY = 220;

function setup(){
  createCanvas(canvasWidth, canvasHeight);
  background(backgroundColor);

  let populated_graph = PopulateGraph(x_points, y_points, radiuses, circlesGraph);
  let path = FindPath(populated_graph, "A0", "A"+(n-1).toString());

  //upscale coordinates and radiuses
  for(let i = 0; i <= n; i++)
  {
    x_points[i] *= multiplicationCoefficient;
    x_points[i] += offsetX;

    y_points[i] *= multiplicationCoefficient;
    y_points[i] += offsetY;
    
    radiuses[i] *= multiplicationCoefficient;
  }

  drawCircles(x_points, y_points, radiuses);
  drawCenters(x_points, y_points);
  drawLabels(x_points, y_points, radiuses);
  drawPath(x_points, y_points, path);
}

function drawCircles(x_points, y_points, radiuses)
{
  stroke(255);
  noFill();
  for(let i = 0; i <= n; i++)
  {
    circle(x_points[i], y_points[i], radiuses[i]*2);
  }
}

function drawLabels(x_points, y_points, radiuses)
{
  noStroke();
  fill(255);
  for(let i = 0; i <= n; i++)
  {
    textSize(32);
    text("A"+i.toString(), x_points[i] - 15, y_points[i] - radiuses[i] - 10);  
  }
}

function drawCenters(x_points, y_points)
{
  for(let i = 0; i <= n; i++)
  {
    drawDot(x_points[i], y_points[i], 255, 50, 50);
  }
}

function drawDot(positionX, positionY, r, g, b)
{
  stroke(r, g, b);
  strokeWeight(10);
  point(positionX, positionY);
}

function drawPath(x_points, y_points, path)
{
  for (let i = 0; i < n-1;)
  {
    let is_circle_in_path = checkInPath("A"+i.toString(), path);

    if(is_circle_in_path)
    {
      for (let j = i + 1; j < n; j++)
      {
        let is_intersecting_circle_in_path = checkInPath("A"+j.toString(), path);

        if(is_intersecting_circle_in_path)
        {
          drawLine(x_points[i], y_points[i], x_points[j], y_points[j], 10, 50, 50, 255);
          i = j;
          break;
        }
      }
    }
  }

  //redraw the centers of the circles in the path
  for(let i = 0; i < n; i++)
  {
    let is_circle_in_path = checkInPath("A"+i.toString(), path);
    if(is_circle_in_path)
    {
      drawDot(x_points[i], y_points[i], 50, 255, 50);
    }
  }
}

function PopulateGraph(x_points, y_points, radiuses, circlesGraph)
{
  for(let i = 0; i < n - 1; i++)
  {
    for(let j = i+1; j < n; j++)
    {
      let x0 = x_points[i]
      let y0 = y_points[i]
      let r0 = radiuses[i]

      let x1 = x_points[j]
      let y1 = y_points[j]
      let r1 = radiuses[j]

      let distance = Math.sqrt(Math.pow((x1 - x0), 2)+ Math.pow((y1 - y0), 2))

      if (!((distance > (r0 + r1)) || ( distance < abs(r0 - r1)) || (distance == 0 && r0 == r1)))
      {
        let a = (Math.pow(r0, 2) - Math.pow(r1, 2) + Math.pow(distance, 2)) / (2*distance)
        let h = Math.sqrt(Math.pow(r0, 2) - Math.pow(a, 2))

        let x2 =  x0 + a * (x1 - x0) / distance
        let y2 = y0 + a * (y1 - x0) / distance
        let x3 = x2 + h * (y1 - y0) / distance
        let y3 = y2 - h * (x1 - x0) / distance

        x2 = round(x2, 2)
        y2 = round(y2, 2)

        x3 = round(x3, 2)
        y3 = round(y3, 2)

        if (!((x3 == x2) && (y3 == y2)))
        {
          if("A"+i.toString() in circlesGraph)
          {
            circlesGraph["A"+i.toString()].push("A"+j.toString());
          }
          else
          {
            circlesGraph["A"+i.toString()] = ["A"+j.toString()];
          }
        }
      }
    }
  }
  return circlesGraph;
}

function FindPath(graph, start, end, path=[])
{
  path = path.concat([start]);

  if(start == end)
  {
    return path;
  }

  if (!start in graph)
  {
    return null;
  }

  for(let circle in graph[start])
  {
    if(!(graph[start][circle] in path))
    {
      let newpath = FindPath(graph, graph[start][circle], end, path);

      if(newpath)
      {
        return newpath;
      }
    }
  }

  return null;
}

function drawLine(x1 ,y1, x2, y2, strokeWeight_, r, g, b)
{
  stroke(r, g, b);
  strokeWeight(strokeWeight_);
  line(x1, y1,x2, y2)
}

//checks if a given circle is in the path
function checkInPath(circle, path)
{
  let  is_circle_in_path = 0;
  path.forEach(node => {
    if(node == circle)
    {
      is_circle_in_path = 1;
    }
  });

  return is_circle_in_path;
}