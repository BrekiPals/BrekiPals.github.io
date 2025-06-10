let nodes = [];
let edges = [];
let num_nodes = 100;
let scale = 1;
let panX = 0;
let panY = 0;
let spacing = 40;
let red = color(255, 0, 0);
let blue = color(0, 0, 255);
function setup() {
    frameRate(10);
    createCanvas(2000,2000);
    
    // Calculate spacing between nodes
    
    // Create nodes in a circle
    let radius = min(width, height) * 0.45; // Use 40% of the smaller canvas dimension
    let centerX = width/2;
    let centerY = height/2;
    
    for(let i = 0; i < num_nodes; i++) {
        let angle = (i * 2 * PI) / num_nodes;
        nodes.push({
            id: i,
            x: centerX + radius * cos(angle),
            y: centerY + radius * sin(angle), 
            color: color(173, 216, 230) // Default color lightblue
        });
    }
    // Connect adjacent nodes with edges
    for(let i = 0; i < nodes.length - 1; i++) {
        edges.push({
            start: nodes[i],
            end: nodes[i+1],
            value: null,
            isArc: false,
            clicked: false,  // Add this new property
            color: color(173, 216, 230) // Default edge color is black
        });
    }
    drawNodes();
}

function take_step() {
    for(let edge of edges) {
        edge.value = jump_distribution();
    }
}

function drawNodes() {
    background(220);
    take_step();
    edges[10].color = red;
    for(let edge of edges) {
        stroke(edge.color || 0);
        
        if (edge.isArc) {
            // Draw an arc instead of a straight line
            let midX = (edge.start.x + edge.end.x) / 2;
            let distance = edge.end.x - edge.start.x;
            let arcHeight = -distance * 0.2; // Adjust this value to change arc height
            
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
        circle(node.x, node.y, 8);
    }
}

function mousePressed() {
    // Check if any edge was clicked
    for(let edge of edges) {
        let d = distToSegment(mouseX, mouseY, edge.start.x, edge.start.y, edge.end.x, edge.end.y);
        if(d < 5 && !edge.clicked) { // Only process if edge hasn't been clicked before
            edge.clicked = true;  // Mark as clicked
            edge.color = Math.random() < 0.5 ? red : blue; // Color the clicked edge red or blue randomly

            if (edge.color.toString() === 'rgba(0,0,255,1)') {
                // Only execute for blue edges

            // Generate random number from exponential distribution
            edge.value = jump_distribution(); // parameter λ=1
            let jump_direction = Math.random() < 0.5 ? 1 : -1;
            edge.value *= jump_direction;

            if (edge.value == 1) {
                edges.push({
                    start: nodes[edge.start.id],
                    end: nodes[edge.start.id + edge.value+1],
                    value: null,
                    isArc: true,
                    clicked: true  // Add clicked property to new edges
                });
            } else if (edge.value == -1) {
                edges.push({
                    start: nodes[edge.end.id],
                    end: nodes[edge.start.id + edge.value],
                    value: null,
                    isArc: true,
                    clicked: true  // Add clicked property to new edges
                });
            } else {
                if (edge.value > 0) {
                edges.push({
                    start: nodes[edge.start.id],
                    end: nodes[edge.start.id + edge.value+1],
                    value: null,
                    isArc: true,
                    clicked: true  // Add clicked property to new edges
                });
                edges.push({
                    start: nodes[edge.end.id],
                    end: nodes[edge.start.id + edge.value+1],
                    value: null,
                    isArc: true,
                    clicked: true  // Add clicked property to new edges
                });
                }
                else {
                    edges.push({
                        start: nodes[edge.start.id],
                        end: nodes[edge.start.id + edge.value],
                        value: null,
                        isArc: true,
                        clicked: true  // Add clicked property to new edges
                    });
                    edges.push({
                        start: nodes[edge.end.id],
                        end: nodes[edge.start.id + edge.value],
                        value: null,
                        isArc: true,
                        clicked: true  // Add clicked property to new edges
                    });
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
function distToSegment(px, py, x1, y1, x2, y2) {
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
}