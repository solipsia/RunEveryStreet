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
var mapHeight = 768;
var windowX, windowY = mapHeight + 50;
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
	solvemode = false,
	choosemapmode = false;
var remainingedges;
var startnodeindex = -1;
var debugsteps = 0;
var bestdistance;
var bestroute;

function setup() {
	windowX = windowWidth;
	mapWidth = windowWidth;
	canvas = createCanvas(windowX, windowY);
	frameRate(1000);
	colorMode(HSB);
	solvebutton = createButton('Solve');
	solvebutton.position(10, mapHeight + 5);
	solvebutton.mousePressed(solve);
	solvebutton.attribute('disabled', ''); // disable the button
	getdatabutton = createButton('Get data');
	getdatabutton.position(350, mapHeight + 5);
	getdatabutton.mousePressed(getOverpassData);
	choosemapmode = true;
}

function draw() {
	if (!choosemapmode) {
		clear();
		showEdges();

		while (solvemode) {
			//if (solvemode == true) {
			shuffle(currentnode.edges, true);
			currentnode.edges.sort((a, b) => a.travels - b.travels);
			let edgewithleasttravels = currentnode.edges[0];
			let nextNode = edgewithleasttravels.OtherNodeofEdge(currentnode);
			edgewithleasttravels.travels++;
			currentroute.addWaypoint(nextNode, edgewithleasttravels.distance);
			currentnode = nextNode;
			if (edgewithleasttravels.travels == 1) { // then first time traveled on this edge
				remainingedges--; //fewer edges that have not been travelled
			}
			if (remainingedges == 0) {
				solvemode = false;
				currentroute.distance += calcdistance(currentnode.lat, currentnode.lon, nodes[startnodeindex].lat, nodes[startnodeindex].lon);
				if (currentroute.distance < bestdistance) { // this latest route is now record
					bestroute = new Route(null, currentroute);
					//bestroute.exportGPX();
					bestdistance = currentroute.distance;
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

function getOverpassData() {
	canvas.position(0, 0);
	choosemapmode = false;
	selectnodemode = true;
	var extent = ol.proj.transformExtent(openlayersmap.getView().calculateExtent(openlayersmap.getSize()), 'EPSG:3857', 'EPSG:4326');
	mapminlat = extent[1];
	mapminlon = extent[0];
	mapmaxlat = extent[3];
	mapmaxlon = extent[2];
	let OverpassURL = "https://overpass-api.de/api/interpreter?data=";
	////WiderShenfield
	//let payload = "%0A%28%0Away%2851.614126037727054%2C0.3124237060546875%2C51.64524078892412%2C0.3632354736328125%29%0A%5B%27name%27%5D%0A%5B%27highway%27%5D%0A%5B%27highway%27%20%21~%20%27path%27%5D%0A%5B%27highway%27%20%21~%20%27steps%27%5D%0A%5B%27highway%27%20%21~%20%27motorway%27%5D%0A%5B%27highway%27%20%21~%20%27motorway_link%27%5D%0A%5B%27highway%27%20%21~%20%27raceway%27%5D%0A%5B%27highway%27%20%21~%20%27bridleway%27%5D%0A%5B%27highway%27%20%21~%20%27proposed%27%5D%0A%5B%27highway%27%20%21~%20%27construction%27%5D%0A%5B%27highway%27%20%21~%20%27elevator%27%5D%0A%5B%27highway%27%20%21~%20%27bus_guideway%27%5D%0A%5B%27highway%27%20%21~%20%27footway%27%5D%0A%5B%27highway%27%20%21~%20%27cycleway%27%5D%0A%5B%27highway%27%20%21~%20%27trunk%27%5D%0A%5B%27highway%27%20%21~%20%27platform%27%5D%0A%5B%27foot%27%20%21~%20%27no%27%5D%0A%5B%27service%27%20%21~%20%27drive-through%27%5D%0A%5B%27service%27%20%21~%20%27parking_aisle%27%5D%0A%5B%27access%27%20%21~%20%27private%27%5D%0A%5B%27access%27%20%21~%20%27no%27%5D%3B%0Anode%28w%29%2851.614126037727054%2C0.3124237060546875%2C51.64524078892412%2C0.3632354736328125%29%3B%0A%29%3B%0Aout%3B";
	//UpperShenfield
	//let payload = "%0A%28%0Away%2851.62870041465817%2C0.3206205368041992%2C51.63770381417218%2C0.3356838226318359%29%0A%5B%27name%27%5D%0A%5B%27highway%27%5D%0A%5B%27highway%27%20%21~%20%27path%27%5D%0A%5B%27highway%27%20%21~%20%27steps%27%5D%0A%5B%27highway%27%20%21~%20%27motorway%27%5D%0A%5B%27highway%27%20%21~%20%27motorway_link%27%5D%0A%5B%27highway%27%20%21~%20%27raceway%27%5D%0A%5B%27highway%27%20%21~%20%27bridleway%27%5D%0A%5B%27highway%27%20%21~%20%27proposed%27%5D%0A%5B%27highway%27%20%21~%20%27construction%27%5D%0A%5B%27highway%27%20%21~%20%27elevator%27%5D%0A%5B%27highway%27%20%21~%20%27bus_guideway%27%5D%0A%5B%27highway%27%20%21~%20%27footway%27%5D%0A%5B%27highway%27%20%21~%20%27cycleway%27%5D%0A%5B%27highway%27%20%21~%20%27trunk%27%5D%0A%5B%27highway%27%20%21~%20%27platform%27%5D%0A%5B%27foot%27%20%21~%20%27no%27%5D%0A%5B%27service%27%20%21~%20%27drive-through%27%5D%0A%5B%27service%27%20%21~%20%27parking_aisle%27%5D%0A%5B%27access%27%20%21~%20%27private%27%5D%0A%5B%27access%27%20%21~%20%27no%27%5D%3B%0Anode%28w%29%2851.62870041465817%2C0.3206205368041992%2C51.63770381417218%2C0.3356838226318359%29%3B%0A%29%3B%0Aout%3B";
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
	});
}

function showNodes() {
	let closestnodetomousedist = Infinity;
	let disttoMouse = 0;
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].show();
		disttoMouse = dist(nodes[i].x, nodes[i].y, mouseX, mouseY);
		if (disttoMouse < closestnodetomousedist) {
			closestnodetomousedist = disttoMouse;
			closestnodetomouse = i;
		}
	}
	if (selectnodemode) {
		startnodeindex = closestnodetomouse;
	}

}

function showStatus() {
	if (startnodeindex > 0) {
		nodes[startnodeindex].highlight();
		fill(255, 0, 0);
		noStroke();
		text("Starting node: " + nodes[startnodeindex].nodeId, 200, windowY - 10)
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
	currentnode = nodes[startnodeindex];
	floodfill(currentnode, 1);
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

function solve() {
	removeOrphans();
	solvemode = true;
	currentnode = nodes[startnodeindex];
	selectnodemode = false;
	remainingedges = edges.length;
	currentroute = new Route(currentnode, null);
	bestroute = new Route(currentnode, null);
	bestdistance = Infinity;
}

function mouseClicked() { // clicked on map to select a node
	if (mouseY < mapHeight) {
		startnodeindex = closestnodetomouse;
		selectnodemode = false;
		solvebutton.removeAttribute('disabled'); // enable the solve button
	}
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