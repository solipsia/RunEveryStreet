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

function setup() {
	//createCanvas(windowWidth, windowHeight);
	let canvas = createCanvas(windowX, windowY);
	canvas.position(0, 0);
	colorMode(HSB);
	button = createButton('submit');
	button.position(10, mapHeight + 5);
	button.mousePressed(parseOverpassXML);
	txtoverpassData = createInput();
	txtoverpassData.position(10, mapHeight + 30);
}

function draw() {
	rect(10, 10, 10, 10);
	var minlat = 51.628906;
	var minlon = 0.3209201;
	var maxlat = 51.637436;
	var maxlon = 0.3352192;
	var extent = [minlon, minlat, maxlon, maxlat];
	map2.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), map2.getSize());
}

function parseOverpassXML() {
	var rawXML = "<mammals><animal>Goat</animal></mammals>";

	//console.log(xml.listChildren());
	parser = new DOMParser();
	xmlDoc = parser.parseFromString(rawXML, "text/xml");
	console.log(xmlDoc.getElementsByTagName("mammals")[0]);
}