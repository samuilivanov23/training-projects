//input parameters
let n = 9;
let xPoints = [0, 3, 6, -7, 8, 9, 4, 19, 25];
let yPoints = [0, 0, 0, 6, 7, 0, 6, 8, 4];
let radiuses = [2, 2, 2, 5, 5, 8, 2, 7, 2];
let circlesGraph = {};
let allPaths = [];

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
  let path = FindAllPaths(populatedGraph, "A0", "A"+(n-1).toString());
  let shortestPath = FindShortestPath(allPaths);

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
  drawPath(xPoints, yPoints, shortestPath);
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

function FindAllPaths(graph, start, end, path=[])
{
  path = path.concat([start]);

  if(start == end)
  {
    allPaths.push(path);
    return path;
  }

  if (!start in graph)
  {
    return null;
  }

  for(let circle in graph[start])
  {
    let isCircleInPath = CheckInPath(graph[start][circle], path);

    if(!(isCircleInPath))
    {
      let newpath = FindAllPaths(graph, graph[start][circle], end, path);
    }
  }
  return null;
}

function FindShortestPath(paths)
{
  let shortestPath = paths[0];

  for(let i = 1; i < paths.length; i++)
  {
    if(paths[i].length < shortestPath.length)
    {
      shortestPath = paths[i];
    }
  }
  return shortestPath;
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