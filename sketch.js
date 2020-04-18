var openlayersmap = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	],
	view: new ol.View({
		center: ol.proj.fromLonLat([0.3192, 51.6297]),
		zoom: 17.8
	})
});


var mapWidth = 1024;
var mapHeight = 768;
var windowX = mapWidth;
var windowY = mapHeight + 50;
let txtoverpassQuery;
var OSMxml;
var numnodes;
var numways;
var nodes;
var minlat = 9999;
var maxlat = -9999;
var minlon = 9999;
var maxlon = -9999;
var nodes = [];
var edges = [];
var mapminlat;
var mapminlon;
var mapmaxlat;
var mapmaxlon;
var totaledgedistance = 0;
var closestnodetomouse = -1;

function preload() {
	let OverpassURL = "https://overpass-api.de/api/interpreter?data=%0A%28%0Away%2851.62870041465817%2C0.3206205368041992%2C51.63770381417218%2C0.3356838226318359%29%0A%5B%27name%27%5D%0A%5B%27highway%27%5D%0A%5B%27highway%27%20%21~%20%27path%27%5D%0A%5B%27highway%27%20%21~%20%27steps%27%5D%0A%5B%27highway%27%20%21~%20%27motorway%27%5D%0A%5B%27highway%27%20%21~%20%27motorway_link%27%5D%0A%5B%27highway%27%20%21~%20%27raceway%27%5D%0A%5B%27highway%27%20%21~%20%27bridleway%27%5D%0A%5B%27highway%27%20%21~%20%27proposed%27%5D%0A%5B%27highway%27%20%21~%20%27construction%27%5D%0A%5B%27highway%27%20%21~%20%27elevator%27%5D%0A%5B%27highway%27%20%21~%20%27bus_guideway%27%5D%0A%5B%27highway%27%20%21~%20%27footway%27%5D%0A%5B%27highway%27%20%21~%20%27cycleway%27%5D%0A%5B%27highway%27%20%21~%20%27trunk%27%5D%0A%5B%27highway%27%20%21~%20%27platform%27%5D%0A%5B%27foot%27%20%21~%20%27no%27%5D%0A%5B%27service%27%20%21~%20%27drive-through%27%5D%0A%5B%27service%27%20%21~%20%27parking_aisle%27%5D%0A%5B%27access%27%20%21~%20%27private%27%5D%0A%5B%27access%27%20%21~%20%27no%27%5D%3B%0Anode%28w%29%2851.62870041465817%2C0.3206205368041992%2C51.63770381417218%2C0.3356838226318359%29%3B%0A%29%3B%0Aout%3B";
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
		positionMap();
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

function setup() {
	//createCanvas(windowWidth, windowHeight);
	let canvas = createCanvas(windowX, windowY);
	canvas.position(0, 0);
	colorMode(HSB);
	button = createButton('submit');
	button.position(10, mapHeight + 5);
	//button.mousePressed(parseOverpassXML);
	txtoverpassData = createInput();
	txtoverpassData.position(10, mapHeight + 30);
}

function draw() {
	clear();
	for (let i = 0; i < edges.length; i++) {
		edges[i].show();

	}
	
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
	if (closestnodetomouse > 0) {
		nodes[closestnodetomouse].highlight();
		fill(255,0,0);
		noStroke();
		text("Starting node: "+nodes[closestnodetomouse].nodeId,200,windowY-10)
	}

}

function positionMap() {
	extent = [minlon, minlat, maxlon, maxlat];
	//try to fit the map to the node data
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

class Node {
	constructor(nodeId_, lat_, lon_) {
		this.nodeId = nodeId_;
		this.lat = lat_;
		this.lon = lon_;
		this.pos = createVector(1, 1);
		this.x = map(this.lon, mapminlon, mapmaxlon, 0, mapWidth);
		this.y = map(this.lat, mapminlat, mapmaxlat, mapHeight, 0);
	}

	show() {
		noStroke();
		colorMode(HSB);
		fill(0, 255, 255, 100);
		ellipse(this.x, this.y, 5);
	}

	highlight() {
		noStroke();
		colorMode(HSB);
		fill(0, 255, 255, 100);
		ellipse(this.x, this.y, 15);
	}
}

class Edge {
	constructor(from_, to_) {
		this.from = from_;
		this.to = to_;
		this.travels = 0;
		this.distance = calcdistance(this.from.lat, this.from.lon, this.to.lat, this.to.lon);
	}

	show() {
		strokeWeight(min(10, (this.travels + 1) * 2));
		if (this.travels > 0) {
			stroke(80, 255, 255, 38);
		} else {
			stroke(255, 255, 255, 255);
		}
		line(this.from.x, this.from.y, this.to.x, this.to.y);
	}
}