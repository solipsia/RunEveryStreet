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

function setup() {
	//createCanvas(windowWidth, windowHeight);
	let canvas = createCanvas(1024, 768);
	canvas.position(0, 0);
	colorMode(HSB);
}

function draw() {
	//background(0);
	rect(10, 10, 10, 10);

	var extent=[0.3209201,51.628906,0.3352192,51.637436];
	map2.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326','EPSG:3857'),map2.getSize());
	
}