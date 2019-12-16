class Board {
  difficulties = {
    EASY: {
      rows: 8,
      cols: 8,
      mines: 10,
    },
    MEDIUM: {
      rows: 16,
      cols: 16,
      mines: 40,
    },
    HARD: {
      rows: 16,
      cols: 30,
      mines: 99,
    },
  };

  constructor(difficulty) {
    this.difficulty = difficulty;

    this.rows = this.difficulties[difficulty].rows;
    this.cols = this.difficulties[difficulty].cols;
    this.mines = this.difficulties[difficulty].mines;

    this.resetCells();
    this.placeMines();
    this.draw();

    this.playing = true;
  }

  resetCells() {
    this.cells = [];
    for (let i = 0; i < this.rows; i++) {
      this.cells[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.cells[i][j] = new Cell(i, j, false, false, false);
      }
    }
  }

  placeMines() {
    let placed = 0;
    while (placed < this.mines) {
      let x = Math.floor(Math.random() * this.rows);
      let y = Math.floor(Math.random() * this.cols);
      if (!this.cells[x][y].isMine) {
        this.cells[x][y].isMine = true;
        placed++;
      }
    }
  }

  draw() {
    for (let i = 0; i < this.rows; i++) {
      // create row element
      const tr = document.createElement('tr');
      for (let j = 0; j < this.cols; j++) {
        // create cell element
        const td = document.createElement('td');
        // set cell id
        td.setAttribute('id', 'row' + i + 'col' + j);
        // set data attributes
        td.setAttribute('data-row', i);
        td.setAttribute('data-col', j);
        // set class
        td.className = 'unrevealed';
        // append to table row
        tr.appendChild(td);
      }
      // add row to board
      document.getElementById('board').appendChild(tr);
    }
  }

  dig(x, y) {
    if (!this.playing) return;

    const element = document.getElementById('row' + x + 'col' + y);

    if (!this.cells[x][y].isFlagged) {
      // only dig cell if it is not flagged

      // set cell to revealed
      this.cells[x][y].isRevealed = true;

      // get a list of adjacent cells
      const adjacent = this.adjacent(x, y);
      // count number of adjacent mines
      const adjacentMines = adjacent.filter((cell) => cell.isMine).length; 

      if (this.cells[x][y].isMine) {
        // cell is a mine, game is over
        this.gameOver(false);
      } else if (adjacentMines) {
        // cell has adjacent mines, reveal amount
        element.className = 'revealed';
        element.className += ' a' + adjacentMines;
        element.innerHTML = adjacentMines;
      } else {
        // cell has no adjacent mines, dig it's neighbors
        element.className = 'revealed';
        for (let i = 0; i < adjacent.length; i++) {
          if (!this.cells[adjacent[i].x][adjacent[i].y].isRevealed) {
            // only dig if not already revealed

            // recurse
            this.dig(adjacent[i].x, adjacent[i].y);
          }
        }
      }
    }

    if (this.hasWon()) {
      this.gameOver(true);
    }
  }

  hasWon() {
    let i = 0;
    let won = true;
    while (won && i < this.rows) {
      let j = 0;
      while (won && j < this.cols) {
        won = this.cells[i][j].isMine || this.cells[i][j].isRevealed;

        j++;
      }

      i++;
    }

    return won;
  }

  flag(x, y) {
    if (!this.playing) return;

    const element = document.getElementById('row' + x + 'col' + y);

    if (!this.cells[x][y].isRevealed) {
      // only flag if not already revealed
      
      if (this.cells[x][y].isFlagged) {
        // if already flagged, unflag
        this.cells[x][y].isFlagged = false;
        element.className = 'unrevealed';
      } else {
        // if not already flagged, flag
        this.cells[x][y].isFlagged = true;
        element.className = 'flagged';
      }
    }
  }

  adjacent(x, y) {
    // create a list of adjacent cells
    const a = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const row = x + i;
        const col = y + j;
        if ((row >= 0)
          && (row < this.rows)
          && (col >= 0)
          && (col < this.cols)
          && ((i !== 0) || (j !== 0))) {
          a.push(this.cells[row][col]);
        }
      }
    }

    return a;
  }

  gameOver(won) {
    this.playing = false;

    if (won) {
      document.getElementById('status').innerHTML = 'You Won!';
    } else {
      this.revealMines();
      document.getElementById('status').innerHTML = 'Game Over!';
    }
  }

  revealMines() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.cells[i][j].isMine) {
          const element = document.getElementById('row' + i + 'col' + j);
          element.className = 'mine';
        }
      }
    }
  }
}

class Cell {
  constructor(x, y, isMine, isRevealed, isFlagged) {
    this.x = x;
    this.y = y;
    this.isMine = isMine;
    this.isRevealed = isRevealed;
    this.isFlagged = isFlagged;
  }
}

function play() {
  const difficulty = document.getElementById('difficulty').value;

  document.getElementById('board').innerHTML = '';
  document.getElementById('status').innerHTML = 'Play!';

  board = new Board(difficulty);
}

document.getElementById('board').addEventListener('click', function(event) {
  const element = event.target;
  if (element.tagName === 'TD') {
    const x = +element.dataset.row;
    const y = +element.dataset.col;
    board.dig(x, y);
  }
});

document.getElementById('board').addEventListener('contextmenu', function(event) {
  event.preventDefault();

  const element = event.target;
  if (element.tagName === 'TD') {
    const x = +element.dataset.row;
    const y = +element.dataset.col;
    board.flag(x, y);
  }
});

let board;

play();

