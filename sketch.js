var openlayersmap = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM(),
			opacity: 0.5
		})
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([0.3192, 51.6297]),
		zoom: 17.8
	})
});

var canvas;
var mapHeight;
var windowX, windowY;
let txtoverpassQuery;
var OSMxml;
var numnodes, numways;
var nodes;
var minlat = Infinity,
	maxlat = -Infinity,
	minlon = Infinity,
	maxlon = -Infinity;
var nodes = [],
	edges = [];
var mapminlat, mapminlon, mapmaxlat, mapmaxlon;
var totaledgedistance = 0;
var closestnodetomouse = -1;
var startnode, currentnode;
var selectnodemode = false,
	solveRESmode = false,
	choosemapmode = false;
var remainingedges;
var debugsteps = 0;
var bestdistance;
var bestroute;
var bestarea;
var bestdoublingsup;
var showSteps = false;
var showRoads = true;
var iterations, iterationsperframe;
var msgbckDiv,msgDiv;

function setup() {
	mapWidth = windowWidth;
	mapHeight = windowHeight;
	windowX = windowWidth;
	windowY = mapHeight//; + 250;
	canvas = createCanvas(windowX, windowY);
	colorMode(HSB);
	btn3 = createButton('Load');
	btn3.position(10, mapHeight - 50);
	btn3.mousePressed(getOverpassData);
	btn4 = createButton('Stop');
	btn4.position(200, mapHeight -50);
	btn4.mousePressed(btnStop);
	chk1 = createCheckbox('Show Steps', showSteps);
	chk1.position(300, mapHeight -50);
	chk1.changed(function(){showSteps = !showSteps;});
	choosemapmode = true;
	iterationsperframe = 1;
	showMessage("Zoom to selected area, tap Load"); 
}

function draw() { //main loop called by the P5.js framework every frame
	if (!choosemapmode) {
		clear();
		if (showRoads) {showEdges();} //draw connections between nodes
		if (solveRESmode) {
			iterationsperframe = max(0.01, iterationsperframe - 1 * (5 - frameRate())); // dynamically adapt iterations per frame to hit 5fps
			for (let it = 0; it < iterationsperframe; it++) {
				iterations++;
				let solutionfound = false;
				while (!solutionfound) { //run randomly down least roads until all roads have been run
					shuffle(currentnode.edges, true);
					currentnode.edges.sort((a, b) => a.travels - b.travels); // sort edges around node by number of times traveled, and travel down least.
					let edgewithleasttravels = currentnode.edges[0]; 
					let nextNode = edgewithleasttravels.OtherNodeofEdge(currentnode);
					edgewithleasttravels.travels++;
					currentroute.addWaypoint(nextNode, edgewithleasttravels.distance);
					currentnode = nextNode;
					if (edgewithleasttravels.travels == 1) { // then first time traveled on this edge
						remainingedges--; //fewer edges that have not been travelled
					}
					if (remainingedges == 0) { //once all edges have been traveled, the route is complete. Work out total distance and see if this route is the best so far.
						solutionfound = true;
						currentroute.distance += calcdistance(currentnode.lat, currentnode.lon, startnode.lat, startnode.lon);
						if (currentroute.distance < bestdistance) { // this latest route is now record
							bestroute = new Route(null, currentroute);
							//bestroute.exportGPX();
							bestdistance = currentroute.distance;
						}
						currentnode = startnode;
						remainingedges = edges.length;
						currentroute = new Route(currentnode, null);
						resetEdges();
					}
				}
			}
		}
		showNodes();
		showStatus();
		if (bestroute != null) {
			bestroute.show();
		}
	}
}

function getOverpassData() { //load nodes and edge map data in XML format from OpenStreetMap via the Overpass API
	hideMessage();
	canvas.position(0, 34); // start just below logo image
	choosemapmode = false;
	bestroute = null;
	var extent = ol.proj.transformExtent(openlayersmap.getView().calculateExtent(openlayersmap.getSize()), 'EPSG:3857', 'EPSG:4326'); //get the coordinates current view on the map
	mapminlat = extent[1];
	mapminlon = extent[0];
	mapmaxlat = extent[3];
	mapmaxlon = extent[2];
	let OverpassURL = "https://overpass-api.de/api/interpreter?data=";
	let overpassquery = "(way({{bbox}})['name']['highway']['highway' !~ 'path']['highway' !~ 'steps']['highway' !~ 'motorway']['highway' !~ 'motorway_link']['highway' !~ 'raceway']['highway' !~ 'bridleway']['highway' !~ 'proposed']['highway' !~ 'construction']['highway' !~ 'elevator']['highway' !~ 'bus_guideway']['highway' !~ 'footway']['highway' !~ 'cycleway']['highway' !~ 'trunk']['highway' !~ 'platform']['foot' !~ 'no']['service' !~ 'drive-through']['service' !~ 'parking_aisle']['access' !~ 'private']['access' !~ 'no'];node(w)({{bbox}}););out;";
	overpassquery = overpassquery.replace("{{bbox}}", mapminlat + "," + mapminlon + "," + mapmaxlat + "," + mapmaxlon);
	overpassquery = overpassquery.replace("{{bbox}}", mapminlat + "," + mapminlon + "," + mapmaxlat + "," + mapmaxlon);
	OverpassURL = OverpassURL + encodeURI(overpassquery);
	httpGet(OverpassURL, 'text', false, function (response) {
		let OverpassResponse = response;
		var parser = new DOMParser();
		OSMxml = parser.parseFromString(OverpassResponse, "text/xml");
		var XMLnodes = OSMxml.getElementsByTagName("node")
		var XMLways = OSMxml.getElementsByTagName("way")
		numnodes = XMLnodes.length;
		numways = XMLways.length;
		for (let i = 0; i < numnodes; i++) {
			var lat = XMLnodes[i].getAttribute('lat');
			var lon = XMLnodes[i].getAttribute('lon');
			minlat = min(minlat, lat);
			maxlat = max(maxlat, lat);
			minlon = min(minlon, lon);
			maxlon = max(maxlon, lon);
		}
		positionMap(minlon, minlat, maxlon, maxlat);
		nodes = [];
		edges = [];
		for (let i = 0; i < numnodes; i++) {
			var lat = XMLnodes[i].getAttribute('lat');
			var lon = XMLnodes[i].getAttribute('lon');
			var nodeid = XMLnodes[i].getAttribute('id');
			let node = new Node(nodeid, lat, lon);
			nodes.push(node);
		}
		//parse ways into edges
		for (let i = 0; i < numways; i++) {
			let wayid = XMLways[i].getAttribute('id');
			let nodesinsideway = XMLways[i].getElementsByTagName('nd');
			for (let j = 0; j < nodesinsideway.length - 1; j++) {
				fromnode = getNodebyId(nodesinsideway[j].getAttribute("ref"));
				tonode = getNodebyId(nodesinsideway[j + 1].getAttribute("ref"));
				if (fromnode != null & tonode != null) {
					let newEdge = new Edge(fromnode, tonode);
					edges.push(newEdge);
					totaledgedistance += newEdge.distance;
				}
			}
		}
		selectnodemode = true;
		showMessage("Tap on start of route");
	});
}

function showNodes() {
	let closestnodetomousedist = Infinity;
	for (let i = 0; i < nodes.length; i++) {
		if (showRoads) {nodes[i].show();}
		disttoMouse = dist(nodes[i].x, nodes[i].y, mouseX, mouseY);
		if (disttoMouse < closestnodetomousedist) {
			closestnodetomousedist = disttoMouse;
			closestnodetomouse = i;
		}
	}
	if (selectnodemode) {
		startnode = nodes[closestnodetomouse]; // highlight the node that's closest to the mouse pointer
	}
}

function showStatus() {
	if (startnode != null) {
		startnode.highlight();
		let textx=150;
		let texty=mapHeight-200;
		fill(0, 5, 225);
		noStroke();
		textSize(12);
		text("Total number nodes: " + nodes.length, 150, texty);
		text("Total number road sections: " + edges.length, 150, texty+20);
		if (bestroute != null) {
			text("Length of roads: " + nf(totaledgedistance, 0, 3) + "km", 150, texty+40);
			if (bestroute.waypoints.length > 0) {
				text("Best route: " + nf(bestroute.distance, 0, 3) + "km, doublings:" + bestdoublingsup + " distance home:" + nf(calcdistance(bestroute.waypoints[bestroute.waypoints.length - 1].lat, bestroute.waypoints[bestroute.waypoints.length - 1].lon, startnode.lat, startnode.lon), 0, 3), 150, texty+60);
			}
			text("Routes tried: " + iterations, 150, texty+80);
			text("Frame rate: " + frameRate(), 150, texty+100);
			text("Solutions per frame: " + iterationsperframe, 150, texty+120);
		}
	}
}

function showEdges() {
	for (let i = 0; i < edges.length; i++) {
		edges[i].show();
	}
}

function resetEdges() {
	for (let i = 0; i < edges.length; i++) {
		edges[i].travels = 0;
	}
}

function removeOrphans() { // remove unreachable nodes and edges 
	resetEdges();
	currentnode = startnode;
	floodfill(currentnode, 1); // recursively walk every unwalked route until all connected nodes have been reached at least once, then remove unwalked ones.
	let newedges = [];
	let newnodes = [];
	for (let i = 0; i < edges.length; i++) {
		if (edges[i].travels > 0) {
			newedges.push(edges[i]);
			if (!newnodes.includes(edges[i].from)) {
				newnodes.push(edges[i].from);
			}
			if (!newnodes.includes(edges[i].to)) {
				newnodes.push(edges[i].to);
			}
		}
	}
	edges = newedges;
	nodes = newnodes;
	resetEdges();
}

function floodfill(node, stepssofar) {
	for (let i = 0; i < node.edges.length; i++) {
		if (node.edges[i].travels == 0) {
			node.edges[i].travels = stepssofar;
			floodfill(node.edges[i].OtherNodeofEdge(node), stepssofar + 1);
		}
	}
}

function solveRES() {
	removeOrphans();
	solveRESmode = true;
	selectnodemode = false;
	showRoads=false;
	remainingedges = edges.length;
	currentroute = new Route(currentnode, null);
	bestroute = new Route(currentnode, null);
	bestdistance = Infinity;
	iterations = 0;
	iterationsperframe = 1;
}

function mouseClicked() { // clicked on map to select a node
	if (mouseY < mapHeight) { //clicked on map
		showNodes(); // recalculate closest node
		selectnodemode = false;
		solveRES();
	}
}

function btnStop() {
	solveRESmode = false;
	solveLoopmode = false;
}

function positionMap(minlon_, minlat_, maxlon_, maxlat_) {
	extent = [minlon_, minlat_, maxlon_, maxlat_];
	//try to fit the map to these coordinates
	openlayersmap.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), openlayersmap.getSize());
	//capture the exact coverage of the map after fitting
	var extent = ol.proj.transformExtent(openlayersmap.getView().calculateExtent(openlayersmap.getSize()), 'EPSG:3857', 'EPSG:4326');
	mapminlat = extent[1];
	mapminlon = extent[0];
	mapmaxlat = extent[3];
	mapmaxlon = extent[2];
}

function calcdistance(lat1, long1, lat2, long2) {
	lat1 = radians(lat1);
	long1 = radians(long1);
	lat2 = radians(lat2);
	long2 = radians(long2);
	return 2 * asin(sqrt(pow(sin((lat2 - lat1) / 2), 2) + cos(lat1) * cos(lat2) * pow(sin((long2 - long1) / 2), 2))) * 6371.0;
}

function getNodebyId(id) {
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].nodeId == id) {
			return nodes[i];
		}
	}
	return null;
}

function showMessage(msg) {
	let xpos = 20;
	msgbckDiv = createDiv('');
	msgbckDiv.style('position','fixed'); 
	msgbckDiv.style('width','400px'); 
	msgbckDiv.style('top',xpos+45+'px'); 
	msgbckDiv.style('left','50%'); 
	msgbckDiv.style('background','black'); 
	msgbckDiv.style('opacity','0.3'); 
	msgbckDiv.style('-webkit-transform','translate(-50%, -50%)'); 
	msgbckDiv.style('transform','translate(-50%, -50%)'); 
	msgbckDiv.style('height','30px');
	msgbckDiv.style('border-radius','10px');
	msgDiv = createDiv('');
	msgDiv.style('position','fixed'); 
	msgDiv.style('width','400px'); 
	msgDiv.style('top',xpos+50+'px'); 
	msgDiv.style('left','50%'); 
	msgDiv.style('color','white'); 
	msgDiv.style('background','none'); 
	msgDiv.style('opacity','1'); 
	msgDiv.style('-webkit-transform','translate(-50%, -50%)'); 
	msgDiv.style('transform','translate(-50%, -50%)'); 
	msgDiv.style('font-family','Lucida Sans Unicode');  
	msgDiv.style('font-size','20px');  
	msgDiv.style('text-align','center');
	msgDiv.style('vertical-align','middle');
	msgDiv.style('height','50px');
	msgDiv.html(msg);
}

function hideMessage(){
	msgbckDiv.style('top',10000+'px'); 
	msgDiv.style('top',10000+'px'); 
}