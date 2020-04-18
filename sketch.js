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
let OSMxml;
var numnodes;
var numways;
var nodes ;
var minlat = 9999;
var maxlat = -9999;
var minlon = 9999;
var maxlon = -9999;

function preload() {
	OSMxml = loadXML("UpperShenfield.xml");
}

function setup() {
	//createCanvas(windowWidth, windowHeight);
	let canvas = createCanvas(windowX, windowY);
	canvas.position(0, 0);
	colorMode(HSB);
	parseOverpassXML();
	button = createButton('submit');
	button.position(10, mapHeight + 5);
	button.mousePressed(parseOverpassXML);
	txtoverpassData = createInput();
	txtoverpassData.position(10, mapHeight + 30);
}

function draw() {
	rect(10, 10, 10, 10);
	var mapminlat = minlat;
	var mapminlon = minlon;
	var mapmaxlat = maxlat;
	var mapmaxlon = maxlon;
	var extent = [mapminlon, mapminlat, mapmaxlon, mapmaxlat];
	map2.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), map2.getSize());
}

function parseOverpassXML() {
	var XMLnodes = OSMxml.getChildren('node');
	var XMLways = OSMxml.getChildren('way');
	numnodes = XMLnodes.length;
	numways = XMLways.length;

	for (i = 0; i < numnodes; i++) {
		lat = XMLnodes[i].getNum("lat");
		lon = XMLnodes[i].getNum("lon");
		minlat = min(minlat, lat);
		maxlat = max(maxlat, lat);
		minlon = min(minlon, lon);
		maxlon = max(maxlon, lon);
	}
	//console.log(minlat,maxlat,minlon,maxlon)
}