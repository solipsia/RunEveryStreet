The live website can be accessed here: https://solipsia.github.io/RunEveryStreet/
# Run Every Street

This is an attempt at solving the [Chinese Postman Problem](https://en.wikipedia.org/wiki/Route_inspection_problem) by calculating the shortest route that covers all possible roads within a selected town at least once.

The tool pulls map data from OpenStreetMap, converts it into a mathematical model (a Graph Database) of nodes and edges, then applies an algorithm that produces a route. The algorithm calculates a large number of routes stochastically and selects the best one. The final route can be downloaded as a GPX file to a Garmin or other GPS.

## How it works

1. When the website is loaded, it loads the background map tileset from OpenStreetMap via the [OpenLayers API](https://openlayers.org/en/latest/apidoc/)
2. The user zooms and pans to select the area to analyse
3. The map XML data is then loaded via the [Overpass API](http://overpass-turbo.eu/)
4. Road segments, junctions and intersections are loaded into a Graph Database consisting of a constellation of nodes (intersections) connected by edges (roads). 
5. This is drawn on the screen using the [p5.js](https://p5js.org) framework.
6. The user clicks on a node to select the starting point and cliks on edges (roads) to remove them from the graph in order to trim the coverage area.
7. Any orphaned nodes or islands that cannot be reached from the starting point are then removed by using a [Flood Fill algorithm](https://en.wikipedia.org/wiki/Flood_fill) from the starting point.
8. The route-finding algorithm then calculates a large number of possible routes from the starting node:
    1. Create a list of all connected edges (roads) emanating from the current node
    2. Sort these by the number of times each edge has been traveled and pick the one with least travels
    3. If there is a tie with multiple edges with the same lowest number of travels, pick one randomly.
    4. Travel down the selected edge
    5. Repeat until all edges have been traveled at least once. 
    6. At this point the route is complete and is drawn on the map graduated from red at the start to green at the end.  
9. Keep repeating above until the user stops the process.
10. Pick the shortest route of all those created and export it to GPX file for download

<p align="center">
  <img width="460" src="/docs/Square.png">
</p>
<p align="center">
  <img width="460" src="/docs/DownloadRoute.png"> 
</p>