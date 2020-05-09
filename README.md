The live website can be accessed here: https://solipsia.github.io/RunEveryStreet/
# RunEveryStreet
<p>
This is an attempt at solving the [Chinese Postman Problem](https://en.wikipedia.org/wiki/Route_inspection_problem) by calculating the shortest route that covers all possible roads within a selected town at least once.
</p>
<p>
The tool works by pulling map data from OpenStreetMap, converts it into a mathematical model of a Graph Database where roads are edges and junctions are nodes. The user picks a starting point and marks out the area to scan and the algorithm stochastically calculates the best route. Once completed, the route can be downloaded as a GPX file to a Garmin or other GPS.
</p>
## Design
- When the website is loaded

## Algorithm
<p align="center">
  <img width="460" src="/docs/Square.png">
</p>
<p align="center">
  <img width="460" src="/docs/DownloadRoute.png"> 
</p>
<p align="center">
  <img width="460" src="/docs/Calculating.png">
</p>