let grid = [];
let rows, cols;
let w = 40; // width and height of each cell
let current;
let algorithm; // store selected algorithm

// Recursive backtracking algorithm
let stack = [];

// Prim's algorithm
let walls = [];
let primInitialized = false; // Ensures Prim's initialization runs once
let nextCell; // Current visiting cell for Prim's Algorithm

let path = []; // Holds the final path for visualization

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.visited = false;
    this.walls = [true, true, true, true]; // Top, Right, Bottom, Left
  }

  show() {
    let x = this.j * w;
    let y = this.i * w;
    stroke(255);
    // Draw walls
    if (this.walls[0]) line(x, y, x + w, y); // Top
    if (this.walls[1]) line(x + w, y, x + w, y + w); // Right
    if (this.walls[2]) line(x + w, y + w, x, y + w); // Bottom
    if (this.walls[3]) line(x, y + w, x, y); // Left

    // Fill the cell if visited
    if (this.visited) {
      noStroke();
      fill("#4CAF50"); // Previously visited cells are green
      rect(x, y, w, w);
    }
  }

  highlight(color = "#FFEB3B") {
    let x = this.j * w;
    let y = this.i * w;
    fill(color); // Current cell is highlighted in yellow by default
    rect(x, y, w, w);
  }

  index(i, j) {
    if (i < 0 || j < 0 || i >= rows || j >= cols) {
      return -1;
    }
    return j + i * cols;
  }

  getUnvisitedNeighbors() {
    let neighbors = [];

    let right = grid[this.index(this.i, this.j + 1)];
    let left = grid[this.index(this.i, this.j - 1)];
    let top = grid[this.index(this.i - 1, this.j)];
    let bottom = grid[this.index(this.i + 1, this.j)];

    if (right && !right.visited) neighbors.push(right);
    if (left && !left.visited) neighbors.push(left);
    if (top && !top.visited) neighbors.push(top);
    if (bottom && !bottom.visited) neighbors.push(bottom);

    return neighbors;
  }

  removeWalls(next) {
    let x = this.j - next.j;

    if (x === -1) {
      this.walls[1] = false;
      next.walls[3] = false;
    } else if (x === 1) {
      this.walls[3] = false;
      next.walls[1] = false;
    }

    let y = this.i - next.i;

    if (y === -1) {
      this.walls[2] = false;
      next.walls[0] = false;
    } else if (y === 1) {
      this.walls[0] = false;
      next.walls[2] = false;
    }
  }

  addWalls() {
    let neighbors = this.getUnvisitedNeighbors();
    for (let neighbor of neighbors) {
      if (!neighbor.visited) {
        walls.push({ cell: this, neighbor });
      }
    }
  }
}

function setup() {
  createCanvas(400, 400);
  rows = width / w;
  cols = height / w;

  // Initialize the grid and cells
  resetGrid();
}

function draw() {
  background('#212121');
  frameRate(8);

  // Draw the grid
  for (let cell of grid) {
    cell.show();
  }

  // Maze generation logic
  if (algorithm === "recursive") {
    recursiveBacktrack();
  } else if (algorithm === "prims") {
    primsMazeGeneration();
  }

  // Automatically call findPath after the maze is generated
  if (algorithm && !isMazeGenerating() && path.length === 0) {
    findPath(grid[0], grid[grid.length - 1]); // From start to end
  }

  // Highlight the path
  for (let cell of path) {
    cell.highlight("#FF5722"); // Highlight the path in orange
  }
}

function recursiveBacktrack() {
  current.visited = true;
  current.highlight();
  let neighbors = current.getUnvisitedNeighbors();

  if (neighbors.length > 0) {
    let next = neighbors[floor(random(0, neighbors.length))];
    next.visited = true;
    stack.push(current);
    current.removeWalls(next);
    current = next;
  } else if (stack.length > 0) {
    current = stack.pop();
  }
}

function primsMazeGeneration() {
  if (!primInitialized) {
    primInitialized = true;
    walls = [];
    grid[0].visited = true;
    grid[0].addWalls();
    nextCell = grid[0];
  }

  if (nextCell) {
    nextCell.highlight();
  }

  if (walls.length > 0) {
    let randomIndex = floor(random(0, walls.length));
    let { cell, neighbor } = walls[randomIndex];
    walls.splice(randomIndex, 1);

    if (!neighbor.visited) {
      neighbor.visited = true;
      cell.removeWalls(neighbor);
      nextCell = neighbor;
      neighbor.addWalls();
    }
  }
}

function isMazeGenerating() {
  if (algorithm === "recursive") return stack.length > 0;
  if (algorithm === "prims") return walls.length > 0;
  return false;
}

function resetGrid() {
  grid = [];
  primInitialized = false;
  path = []; // Clear path
  rows = width / w;
  cols = height / w;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let cell = new Cell(i, j);
      grid.push(cell);
    }
  }
  current = grid[0];
}

function getValidNeighbors(cell) {
  let neighbors = [];
  let directions = [
    { i: -1, j: 0, wall: 0 }, // Top
    { i: 1, j: 0, wall: 2 },  // Bottom
    { i: 0, j: -1, wall: 3 }, // Left
    { i: 0, j: 1, wall: 1 }   // Right
  ];

  for (let dir of directions) {
    let ni = cell.i + dir.i;
    let nj = cell.j + dir.j;
    let neighbor = grid[cell.index(ni, nj)];

    if (neighbor && !cell.walls[dir.wall] && !neighbor.walls[(dir.wall + 2) % 4]) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

function findPath(start, end) {
  let queue = [];
  let visited = new Set();
  let parent = new Map();

  queue.push(start);
  visited.add(start);

  while (queue.length > 0) {
    let current = queue.shift();

    if (current === end) {
      break;
    }

    let neighbors = getValidNeighbors(current);

    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        parent.set(neighbor, current);
      }
    }
  }

  let step = end;
  while (step) {
    path.push(step);
    step = parent.get(step);
    if (step === start) {
      path.push(step);
      break;
    }
  }
  path.reverse();
}

// Event listeners to select algorithm
document.getElementById('recursive').addEventListener('click', () => {
  algorithm = "recursive";
  resetGrid();
});

document.getElementById('prims').addEventListener('click', () => {
  algorithm = "prims";
  resetGrid();
});
