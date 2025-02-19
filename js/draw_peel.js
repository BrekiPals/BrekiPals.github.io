let nodes = [];
let edges = [];
let num_nodes = 500;
let scale = 1;
let panX = 0;
let panY = 0;
let spacing = 40;

function setup() {
    createCanvas(spacing*num_nodes+ spacing*10, 800);
    
    // Calculate spacing between nodes
    
    // Create nodes horizontally with even spacing
    for(let i = 0; i < num_nodes; i++) {
        nodes.push({
            x: spacing * (i + 1),
            y: height/2,
            color: color(173, 216, 230) // Default color lightblue
        });
    }
    
    // Connect adjacent nodes with edges
    for(let i = 0; i < nodes.length - 1; i++) {
        edges.push({
            start: nodes[i],
            end: nodes[i+1],
            value: null  // Will store the random value
        });
    }

    drawNodes();
}

function drawNodes() {
    background(220);
    
    // Draw the edges with their colors
    for(let edge of edges) {
        stroke(edge.color || 0);
        line(edge.start.x, edge.start.y, edge.end.x, edge.end.y);
        
        // If edge has a value, display it
        if (edge.value !== null) {
            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            let midX = (edge.start.x + edge.end.x) / 2;
            let midY = (edge.start.y + edge.end.y) / 2 - 10;
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
        let d = distToSegment(mouseX, mouseY, edge.start.x, edge.start.y, edge.end.x, edge.end.y);
        if(d < 5) { // If click is within 5 pixels of the edge
            edge.color = color(255, 0, 0); // Make it red
            
            // Generate random number from exponential distribution
            edge.value = jump_distribution(); // parameter λ=1
            
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


function stirling_approx(n) {
    if (n === 0) {
        return 1;
    }
    return Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n);
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