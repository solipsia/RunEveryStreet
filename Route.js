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
            let from = createVector(this.waypoints[i].x, this.waypoints[i].y);
            let to = createVector(this.waypoints[i + 1].x, this.waypoints[i + 1].y);
            let vline = p5.Vector.sub(to, from);
            let hue = map(i, 0, this.waypoints.length - 1, 0, 155);
            stroke(hue, 255, 255, 0.5);
            line(from.x, from.y, to.x, to.y);
            if (showSteps) {
                fill(hue, 255, 55, 0.8);
                noStroke();
                textSize(8);
                let textangle = vline.heading() + HALF_PI;
                text(i, 10 * cos(textangle) + (from.x + to.x) / 2 - 5, 10 * sin(textangle) + (from.y + to.y) / 2);
            }

        }
        noStroke();
        fill(0, 255, 255, 255);
        if (this.waypoints.length > 0) {
            ellipse(this.waypoints[0].x, this.waypoints[0].y, 20, 20); //first waypoint
        }

        fill(149, 255, 255, 255);
        ellipse(this.waypoints[bestroute.waypoints.length - 1].x, this.waypoints[bestroute.waypoints.length - 1].y, 20, 20); //last waypoint
    }
}