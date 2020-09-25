import math

circles_graph = dict()

def buildGraph(n):
    f = open("../../../notes/circles-input.txt", mode="r")
    file_contents = f.read().split("\n")[1:]
    f.close()

    x_points = []
    y_points = []
    radiuses = []

    for line in file_contents[:(len(file_contents) - 1)]:
        x_points.append(int(line.split(' ')[0]))
        y_points.append(int(line.split(' ')[1]))
        radiuses.append(int(line.split(' ')[2]))

    # for i in range(n):
    #     x = int(input("x" + str(i + 1) + ": "))
    #     y = int(input("y" + str(i + 1) + ": "))
    #     r = int(input("r" + str(i + 1) + ": "))

    #     while (x <= -10000 or x >= 10000) or (y <= -10000 or y >= 10000) or (r <= 0 or r >= 10000):
    #         print("Numbers not in range")
    #         x = int(input("x" + str(i + 1) + ": "))
    #         y = int(input("y" + str(i + 1) + ": "))
    #         r = int(input("r" + str(i + 1) + ": "))
        
    #     x_points.append(x)
    #     y_points.append(y)
    #     radiuses.append(r)

    i = 0
    while i < n:
        j = 0
        while j < n:
            if not i == j:
                x0 = x_points[i]
                y0 = y_points[i]
                r0 = radiuses[i]

                x1 = x_points[j]
                y1 = y_points[j]
                r1 = radiuses[j]

                distance = math.sqrt(math.pow((x1 - x0), 2)+ math.pow((y1 - y0), 2))

                if not ((distance > (r0 + r1)) or 
                    (distance < abs(r0 - r1)) or 
                    (distance == 0 and r0 == r1) or
                    (distance == (r0 + r1)) or
                    (distance == abs(r0 - r1))):

                    circle = "A"+str(i)
                    intersecting_circle = "A"+str(j)
                    
                    if circle in circles_graph:    
                        circles_graph[circle].append(intersecting_circle)
                    else:
                        circles_graph[circle] = [intersecting_circle]
            j += 1
        i+=1
    
    print(circles_graph) 

def shortestPath(graph, start, end):
    explored = [] 
    queue = [[start]]

    if not start in graph:
        return -1

    if start == end: 
        return [start]
      
    while queue: 
        path = queue.pop(0)
        node = path[-1] 
        
        if not node in explored: 
            neighbours = graph[node] 
            
            for neighbour in neighbours:
                if not neighbour in path:
                    new_path = list(path)
                    new_path.append(neighbour) 
                    queue.append(new_path)
                
                if neighbour == end: 
                    print("Shortest path = ", *new_path) 
                    return new_path
            explored.append(node) 
  
    print("Path does not exist") 
    return - 1

if __name__ == "__main__": 
    
    # n = int(input("n: "))
    # while (n < 2 or n > 1000):
    #     print("Number not in range: between 1 and 10000")
    #     n = int(input("n: "))
    
    n = 1000
    # Build graph
    buildGraph(n)


    # Find path
    path = shortestPath(circles_graph, "A0", "A"+str(n-1))

    if path == -1:
        print(path)
    else:
        print(len(path) - 1)