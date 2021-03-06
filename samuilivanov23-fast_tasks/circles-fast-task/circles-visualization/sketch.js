//input parameters
let n = 9;
let xPoints = [0, 3, 6, -7, 4, 8, 9, 19, 25];
let yPoints = [0, 0, 0, 6, 6, 7, 0, 8, 4];
let radiuses = [2, 2, 2, 5, 2, 5, 8, 7, 2];
let circlesGraph = {};
let shortestPath = [];

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

  let populatedGraph = PopulateGraph(xPoints, yPoints, radiuses, circlesGraph);
  let resultPath = ShortestPath(populatedGraph, "A0", "A"+(n-1).toString())

  //upscale coordinates and radiuses
  for(let i = 0; i <= n; i++)
  {
    xPoints[i] *= multiplicationCoefficient;
    xPoints[i] += offsetX;

    yPoints[i] *= multiplicationCoefficient;
    yPoints[i] += offsetY;
    
    radiuses[i] *= multiplicationCoefficient;
  }

  drawCircles(xPoints, yPoints, radiuses);
  drawCenters(xPoints, yPoints);
  drawLabels(xPoints, yPoints, radiuses);
  drawPath(xPoints, yPoints, resultPath);
}

function drawCircles(xPoints, yPoints, radiuses)
{
  stroke(255);
  noFill();
  for(let i = 0; i <= n; i++)
  {
    circle(xPoints[i], yPoints[i], radiuses[i]*2);
  }
}

function drawLabels(xPoints, yPoints, radiuses)
{
  noStroke();
  fill(255);
  for(let i = 0; i <= n; i++)
  {
    textSize(32);
    text("A"+i.toString(), xPoints[i] - 15, yPoints[i] - radiuses[i] - 10);  
  }
}

function drawCenters(xPoints, yPoints)
{
  for(let i = 0; i <= n; i++)
  {
    drawDot(xPoints[i], yPoints[i], 255, 50, 50);
  }
}

function drawDot(positionX, positionY, r, g, b)
{
  stroke(r, g, b);
  strokeWeight(10);
  point(positionX, positionY);
}

function drawPath(xPoints, yPoints, path)
{
  for(let i = 0 ; i < path.length - 1; i++)
  {
    let currentCircleIndex = GetCircleIndex(path[i]);
    let nextCircleIndex = GetCircleIndex(path[i+1]);
    drawLine(xPoints[currentCircleIndex], yPoints[currentCircleIndex], xPoints[nextCircleIndex], yPoints[nextCircleIndex], 10, 50, 50, 255);
  }

  //redraw the centers of the circles in the path
  for(let i = 0 ; i < path.length; i++)
  {
    let currentCircleIndex = GetCircleIndex(path[i]);
    drawDot(xPoints[currentCircleIndex], yPoints[currentCircleIndex], 50, 255, 50);
  }
}

function PopulateGraph(xPoints, yPoints, radiuses, circlesGraph)
{
  for(let i = 0; i < n; i++)
  {
    for(let j = 0; j < n; j++)
    {
      if(i != j)
      {
      	let x0 = xPoints[i]
	      let y0 = yPoints[i]
	      let r0 = radiuses[i]

	      let x1 = xPoints[j]
	      let y1 = yPoints[j]
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
  }
  return circlesGraph;
}

function ShortestPath(graph, start, end)
{
  let explored = [];
  let queue = [[start]];

  if(!(start in graph))
  {
    return -1;
  }

  if(start == end)
  {
    return [start];
  }

  while(queue.length != 0)
  {
    let path = queue.shift();
    let circle = path[path.length - 1];

    let isCircleInExplored = CheckInPath(circle, explored);
    if(!(isCircleInExplored))
    {
      let neighbours = graph[circle];

      neighbours.forEach(neighbour => {
        let isNeighbourInPath = CheckInPath(neighbour, path);
        let new_path = [];

        if(!(isNeighbourInPath))
        {
          new_path = path.concat(neighbour);
          queue.push(new_path);
        }

        if(neighbour == end)
        {
          if(shortestPath.length > new_path.length || shortestPath.length == 0)
          {
            shortestPath = new_path;
          }
        }
      });
      explored.push(circle);
    }
  }

  if(shortestPath.length != 0)
  {
    return shortestPath;
  }
  else
  {
    return -1;
  }
}

function drawLine(x1 ,y1, x2, y2, strokeWeight_, r, g, b)
{
  stroke(r, g, b);
  strokeWeight(strokeWeight_);
  line(x1, y1,x2, y2)
}

//checks if a given circle is in the path
function CheckInPath(circle, path)
{
  let  isCircleInPath = 0;
  path.forEach(node => {
    if(node == circle)
    {
      isCircleInPath = 1;
    }
  });

  return isCircleInPath;
}

function GetCircleIndex(circle)
{
  return parseInt(circle.slice(-1));
}