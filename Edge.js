class Edge { //section of road that connects nodes
	constructor(from_, to_) {
		this.from = from_;
		this.to = to_;
		this.travels = 0;
		this.distance = calcdistance(this.from.lat, this.from.lon, this.to.lat, this.to.lon);
		if (!this.from.edges.includes(this)) {
			this.from.edges.push(this);
		}
		if (!this.to.edges.includes(this)) {
			this.to.edges.push(this);
		}
	}

	show() {
		strokeWeight(min(10, (this.travels + 1) * 2));
		stroke(55, 255, 255, 0.8);
		line(this.from.x, this.from.y, this.to.x, this.to.y);
		fill(0);
		noStroke();
	}

	OtherNodeofEdge(node) {
		if (node == this.from) {
			return this.to;
		} else {
			return this.from;
		}
	}
}