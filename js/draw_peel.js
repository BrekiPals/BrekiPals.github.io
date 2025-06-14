let nodes = [];
let edges = [];
let next_node = [];
let prev_node = [];
let num_nodes = 800;
let scale = 1;
let panX = 0;
let panY = 0;
let spacing = 40;
let p = 0.5;

function walk(node_id, num_steps) {
    if (num_steps < 0) {
        for (let i = 0; i < -num_steps; i++) {
            node_id = prev_node[node_id];
        }
    } else {
        for (let i = 0; i < num_steps; i++) {
            node_id = next_node[node_id];
        }
    }
    return node_id;
}

function setup() {
    createCanvas(spacing*num_nodes+ spacing*10,windowWidth * 0.8);
    
    // Calculate spacing between nodes
    
    // Create nodes horizontally with even spacing
    for(let i = 0; i < num_nodes; i++) {
        nodes.push({
            id: i,
            x: spacing * (i + 1),
            y: height/2,
            color: color(173, 216, 230) // Default color lightblue
        });
        if (i == num_nodes-1) {
            next_node.push(0);
            prev_node.push(num_nodes-2);
        } else if (i == 0) {
            next_node.push(1);
            prev_node.push(num_nodes-1);
        } else {
            next_node.push(i+1);
            prev_node.push(i-1);
        }
    }
    
    // Connect adjacent nodes with edges
    for(let i = 0; i < nodes.length - 1; i++) {
        edges.push({
            start: nodes[i],
            end: nodes[i+1],
            value: null,
            isArc: false,
            clicked: false  // Add this new property
        });
    }
    edges.push({
        start: nodes[num_nodes-1],
        end: nodes[0],
        value: null,
        isArc: true,
        clicked: false  // Add this new property
    });

    drawNodes();
}

function drawNodes() {
    background(220);
    
    // Draw the edges with their colors
    for(let edge of edges) {
        stroke(edge.color || 0);
        
        if (edge.isArc) {
            // Draw an arc instead of a straight line
            let midX = (edge.start.x + edge.end.x) / 2;
            let distance = edge.end.x - edge.start.x;
            let arcHeight = Math.abs(distance) * 0.2; // Adjust this value to change arc height
            
            noFill();
            beginShape();
            vertex(edge.start.x, edge.start.y);
            quadraticVertex(midX, edge.start.y + arcHeight, edge.end.x, edge.end.y);
            endShape();
        } else {
            // Draw regular straight line
            line(edge.start.x, edge.start.y, edge.end.x, edge.end.y);
        }
        
        // If edge has a value, display it
        if (edge.value !== null) {
            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            let midX = (edge.start.x + edge.end.x) / 2;
            let midY = (edge.start.y + edge.end.y) / 2 - 10;
            // Adjust text position if it's an arc
            if (edge.isArc) {
                midY -= 20;
            }
            text(edge.value.toFixed(2), midX, midY);
        }
    }
    
    // Reset stroke for nodes
    stroke(0);
    // Draw all nodes
    for(let node of nodes) {
        fill(node.color);
        circle(node.x, node.y, 10);
    }
}

function mousePressed() {
    // Check if any edge was clicked
    for(let edge of edges) {
        let d = distToSegment(mouseX, mouseY, edge.start.x, edge.start.y, edge.end.x, edge.end.y, edge.isArc);
        if(d < 7 && !edge.clicked) { // Only process if edge hasn't been clicked before
            edge.clicked = true;  // Mark as clicked
            edge.color = Math.random() < p ? color(255, 0, 0) : color(0, 0, 255);

            if (edge.color.toString() === 'rgba(0,0,255,1)') {
                // Only execute for blue edges

            // Generate random number from exponential distribution
            edge.value = jump_distribution(); 
            let jump_direction = Math.random() < 0.5 ? 1 : -1;
            edge.value *= jump_direction;

            if (edge.value == 1) {
                end = walk(edge.start.id,2);
                edges.push({
                    start: nodes[edge.start.id],
                    end: nodes[end],
                    value: null,
                    isArc: true,
                    clicked: false  // Add clicked property to new edges
                });
                next_node[edge.start.id] = end;
                prev_node[end] = edge.start.id;
            } else if (edge.value == -1) {
                end = walk(edge.end.id,-2);
                edges.push({
                    start: nodes[edge.end.id],
                    end: nodes[end],
                    value: null,
                    isArc: true,
                    clicked: false  // Add clicked property to new edges
                });
                prev_node[edge.end.id] = end;
                next_node[end] = edge.end.id;
            } else {
                if (edge.value > 0) {
                end = walk(edge.start.id,edge.value+1);
                edges.push({
                    start: nodes[edge.start.id],
                    end: nodes[end],
                    value: null,
                    isArc: true,
                    clicked: false  // Add clicked property to new edges
                });
                next_node[edge.start.id] = end;
                prev_node[end] = edge.start.id;
                edges.push({
                    start: nodes[edge.end.id],
                    end: nodes[end],
                    value: null,
                    isArc: true,
                    clicked: false  // Add clicked property to new edges
                });
                }
                else {
                    end = walk(edge.start.id,edge.value);
                    edges.push({
                        start: nodes[edge.start.id],
                        end: nodes[end],
                        value: null,
                        isArc: true,
                        clicked: true  // Add clicked property to new edges
                    });
                    edges.push({
                        start: nodes[edge.end.id],
                        end: nodes[end],
                        value: null,
                        isArc: true,
                        clicked: true  // Add clicked property to new edges
                    });
                    prev_node[edge.end.id] = end;
                    next_node[end] = edge.end.id;
                }
            }
        }
        drawNodes();
        break;
    }
}
}

function sFact(num)
{
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}



function sFact(num)
{
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}

function log_sum_until(j) {
    let acc = 0;
    for (let i = 1; i <= j; i++) {
        acc += Math.log(i);
    }
    return acc;
}

function log_distribution_j(j) {
    return Math.log(j+1)+Math.log(2)+log_sum_until(2*j-2) - log_sum_until(j-1) - log_sum_until(j+1) - j*Math.log(4);
}

function jump_distribution_j(j) {
    return Math.exp(log_distribution_j(j));
}


// Generate random number from exponential distribution
function jump_distribution() {
    let x = random();
    let acc = 0;
    for (let i = 1; i < 10000; i++) {
        jump_j = jump_distribution_j(i);
        if (isNaN(jump_j)) {
            jump_j = 0;
        }
        console.log('jump_j',jump_j);
        acc += jump_j;
        console.log('acc',acc,'i',i,'x',x);
        if (x < acc) {
            console.log("returning " + i);
            return i;
        }
    }
    return 10000;
}

// Helper function to calculate distance from point to line segment
function distToSegment(px, py, x1, y1, x2, y2, isArc = false) {
    if (!isArc) {
        let A = px - x1;
        let B = py - y1;
        let C = x2 - x1;
        let D = y2 - y1;

        let dot = A * C + B * D;
        let len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq != 0) param = dot / len_sq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        let dx = px - xx;
        let dy = py - yy;
        return sqrt(dx * dx + dy * dy);
    } else {
        // For arc (quadratic Bezier curve)
        let midX = (x1 + x2) / 2;
        let distance = x2 - x1;
        let arcHeight = Math.abs(distance) * 0.2;
        let controlY = y1 + arcHeight;  // Control point y-coordinate
        
        // Approximate distance by sampling points along the curve
        let minDist = Infinity;
        let steps = 20;  // Number of segments to approximate curve
        
        for (let i = 0; i <= steps; i++) {
            let t = i / steps;
            // Quadratic Bezier formula
            let bx = (1-t)*(1-t)*x1 + 2*(1-t)*t*midX + t*t*x2;
            let by = (1-t)*(1-t)*y1 + 2*(1-t)*t*controlY + t*t*y2;
            
            // Calculate distance to this point
            let dx = px - bx;
            let dy = py - by;
            let dist = sqrt(dx * dx + dy * dy);
            
            minDist = min(minDist, dist);
        }
        
        return minDist;
    }
}