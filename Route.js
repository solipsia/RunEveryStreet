class Route {
    constructor(startnode, originalroute) {
        if (originalroute == null) { // start with just a node
            this.waypoints = [];
            this.waypoints.push(startnode);
            this.distance = 0;
        } else { // make a copy of a route
            this.waypoints = [];
            for (let i = 0; i < originalroute.waypoints.length; i++) {
                this.waypoints.push(originalroute.waypoints[i]);
            }
            this.distance = originalroute.distance;
        }
    }

    addWaypoint(node, dist) {
        this.waypoints.push(node);
        this.distance += dist;
    }

    show() {
        stroke(255, 255, 255, 55);
        strokeWeight(5);
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            stroke(map(i, 0, this.waypoints.length - 1, 0, 155), 255, 255, 200);
            line(this.waypoints[i].x, this.waypoints[i].y, this.waypoints[i + 1].x, this.waypoints[i + 1].y);
            fill(0, 0, 0, 150);
            noStroke();
            let textangle = map(i % 10, 0, 10, 0, TWO_PI);
            text(i, 17 * cos(textangle) + (this.waypoints[i].x + this.waypoints[i + 1].x) / 2, 17 * sin(textangle) + (this.waypoints[i].y + this.waypoints[i + 1].y) / 2);
        }
        noStroke();
        fill(149, 255, 255, 255);
        if (this.waypoints.length > 0) {
            ellipse(this.waypoints[0].x, this.waypoints[0].y, 20, 20); //first waypoint
        }

        fill(49, 255, 255, 255);
        //ellipse(waypoints.get(bestroute.waypoints.length - 1).pos.x, waypoints.get(bestroute.waypoints.length - 1).pos.y, 20, 20); //last waypoint
    }
}