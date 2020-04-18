var map2 = new ol.Map({
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

function preload() {
	//OSMxml = loadXML("UpperShenfield.xml");
	xxxx = 2;
	let OverpassURL = "http://overpass-api.de/api/interpreter?data=%0A%28%0Away%2851.62870041465817%2C0.3206205368041992%2C51.63770381417218%2C0.3356838226318359%29%0A%5B%27name%27%5D%0A%5B%27highway%27%5D%0A%5B%27highway%27%20%21~%20%27path%27%5D%0A%5B%27highway%27%20%21~%20%27steps%27%5D%0A%5B%27highway%27%20%21~%20%27motorway%27%5D%0A%5B%27highway%27%20%21~%20%27motorway_link%27%5D%0A%5B%27highway%27%20%21~%20%27raceway%27%5D%0A%5B%27highway%27%20%21~%20%27bridleway%27%5D%0A%5B%27highway%27%20%21~%20%27proposed%27%5D%0A%5B%27highway%27%20%21~%20%27construction%27%5D%0A%5B%27highway%27%20%21~%20%27elevator%27%5D%0A%5B%27highway%27%20%21~%20%27bus_guideway%27%5D%0A%5B%27highway%27%20%21~%20%27footway%27%5D%0A%5B%27highway%27%20%21~%20%27cycleway%27%5D%0A%5B%27highway%27%20%21~%20%27trunk%27%5D%0A%5B%27highway%27%20%21~%20%27platform%27%5D%0A%5B%27foot%27%20%21~%20%27no%27%5D%0A%5B%27service%27%20%21~%20%27drive-through%27%5D%0A%5B%27service%27%20%21~%20%27parking_aisle%27%5D%0A%5B%27access%27%20%21~%20%27private%27%5D%0A%5B%27access%27%20%21~%20%27no%27%5D%3B%0Anode%28w%29%2851.62870041465817%2C0.3206205368041992%2C51.63770381417218%2C0.3356838226318359%29%3B%0A%29%3B%0Aout%3B";
	httpGet(OverpassURL, 'text', false, function (response) {
		let OverpassResponse = response;
		var parser = new DOMParser();
		OSMxml = parser.parseFromString(OverpassResponse, "text/xml");
		var XMLnodes = OSMxml.getElementsByTagName("node")
		var XMLways = OSMxml.getElementsByTagName("way")
		numnodes = XMLnodes.length;
		numways = XMLways.length;
		for (let i = 0; i < numnodes; i++) {
			var lat=XMLnodes[i].getAttribute('lat');
			var lon=XMLnodes[i].getAttribute('lon');
			minlat = min(minlat, lat);
			maxlat = max(maxlat, lat);
			minlon = min(minlon, lon);
			maxlon = max(maxlon, lon);
		}
		for (let i = 0; i < numnodes; i++) {
			var lat=XMLnodes[i].getAttribute('lat');
			var lon=XMLnodes[i].getAttribute('lon');
			var nodeid=XMLnodes[i].getAttribute('id');
		}


	});
}

function setup() {
	//createCanvas(windowWidth, windowHeight);
	let canvas = createCanvas(windowX, windowY);
	canvas.position(0, 0);
	colorMode(HSB);
	//parseOverpassXML();

	button = createButton('submit');
	button.position(10, mapHeight + 5);
	button.mousePressed(parseOverpassXML);
	txtoverpassData = createInput();
	txtoverpassData.position(10, mapHeight + 30);
	positionMap();
}

function draw() {
	positionMap();
}

function positionMap() {
	rect(10, 10, 10, 10);
	var mapminlat = minlat;
	var mapminlon = minlon;
	var mapmaxlat = maxlat;
	var mapmaxlon = maxlon;
	var extent = [mapminlon, mapminlat, mapmaxlon, mapmaxlat];
	map2.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), map2.getSize());
}

function parseOverpassXML() {



}