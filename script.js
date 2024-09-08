const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message'); // Message element

// Grid and node configuration
const cols = 30;
const rows = 30;
const nodeSize = 20;
canvas.width = cols * nodeSize;
canvas.height = rows * nodeSize;

// Define colors
const colors = {
    empty: '#ffffff',
    start: '#0000ff',
    end: '#ff0000',
    barrier: '#000000',
    visited: '#ffcc00',
    path: '#00ff00'
};

let grid = [];
let startNode = null;
let endNode = null;
let isDragging = false;

// Node Class to represent each cell in the grid
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isBarrier = false;
        this.distance = Infinity;
        this.previous = null;
    }

    draw(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x * nodeSize, this.y * nodeSize, nodeSize, nodeSize);
        ctx.strokeRect(this.x * nodeSize, this.y * nodeSize, nodeSize, nodeSize);
    }
}

// Create the grid
function createGrid() {
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            const node = new Node(i, j);
            grid[i][j] = node;
            node.draw(colors.empty);
        }
    }
}

// Get the clicked node
function getNodeFromPosition(x, y) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = Math.floor((x - rect.left) / nodeSize);
    const mouseY = Math.floor((y - rect.top) / nodeSize);
    return grid[mouseX][mouseY];
}

// Handle mouse click to set start, end, or barriers
canvas.addEventListener('mousedown', (e) => {
    const node = getNodeFromPosition(e.clientX, e.clientY);
    if (!startNode) {
        startNode = node;
        startNode.draw(colors.start);
    } else if (!endNode) {
        endNode = node;
        endNode.draw(colors.end);
    } else {
        isDragging = true;
        node.isBarrier = true;
        node.draw(colors.barrier);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const node = getNodeFromPosition(e.clientX, e.clientY);
        if (!node.isBarrier && node !== startNode && node !== endNode) {
            node.isBarrier = true;
            node.draw(colors.barrier);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Dijkstra's algorithm implementation
function dijkstra() {
    let unvisitedNodes = [];
    startNode.distance = 0;

    // Initialize unvisited nodes
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            unvisitedNodes.push(grid[i][j]);
        }
    }

    // Algorithm loop
    while (unvisitedNodes.length > 0) {
        // Sort unvisited nodes by distance
        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const currentNode = unvisitedNodes.shift();

        // If the current node is the end node, draw the path and return
        if (currentNode === endNode) {
            drawPath(endNode);
            displayMessage('Path found!');
            return;
        }

        // If the smallest distance is infinity, there's no path
        if (currentNode.distance === Infinity) {
            displayMessage('No path found.');
            return;
        }

        // Mark the current node as visited
        currentNode.draw(colors.visited);

        // Update distances for the neighbors
        for (let neighbor of getNeighbors(currentNode)) {
            if (!neighbor.isBarrier) {
                const altDistance = currentNode.distance + 1;
                if (altDistance < neighbor.distance) {
                    neighbor.distance = altDistance;
                    neighbor.previous = currentNode;
                }
            }
        }
    }
}

// Get neighbors of a node
function getNeighbors(node) {
    const neighbors = [];
    const { x, y } = node;

    if (x > 0) neighbors.push(grid[x - 1][y]); // Left
    if (x < cols - 1) neighbors.push(grid[x + 1][y]); // Right
    if (y > 0) neighbors.push(grid[x][y - 1]); // Up
    if (y < rows - 1) neighbors.push(grid[x][y + 1]); // Down

    return neighbors;
}

// Draw the shortest path
function drawPath(endNode) {
    let currentNode = endNode;
    while (currentNode.previous) {
        currentNode = currentNode.previous;
        if (currentNode !== startNode) {
            currentNode.draw(colors.path);
        }
    }
}

// Display a message
function displayMessage(message) {
    messageDiv.textContent = message;
}

// Button event handlers
document.getElementById('startBtn').addEventListener('click', () => {
    if (startNode && endNode) {
        dijkstra();
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    startNode = null;
    endNode = null;
    grid = [];
    createGrid();
    displayMessage(''); // Clear message on reset
});

// Initialize the grid on page load
createGrid();
