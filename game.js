const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const downButton = document.getElementById('down-button');
const upButton = document.getElementById('up-button');
const aButton = document.getElementById('a-button');
const bButton = document.getElementById('b-button');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

// Adjust canvas size based on constants
context.canvas.width = COLS * BLOCK_SIZE;
context.canvas.height = ROWS * BLOCK_SIZE;

// Scale the context to fill the canvas
context.scale(BLOCK_SIZE, BLOCK_SIZE);

// Next piece canvas
nextContext.canvas.width = 4 * BLOCK_SIZE;
nextContext.canvas.height = 4 * BLOCK_SIZE;
nextContext.scale(BLOCK_SIZE, BLOCK_SIZE);


const COLORS = {
    darkest: '#0f380f',
    dark: '#306230',
    light: '#8bac0f',
    lightest: '#9bbc0f'
};

const TETROMINOES = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'L': [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    'J': [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    'O': [
        [1,1],
        [1,1]
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    'T': [
        [0,0,0],
        [1,1,1],
        [0,1,0]
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ]
};


let lastTime = 0;
let rAF; // requestAnimationFrame
let player;
let playfield;
let score;
let lines;
let level;
let gameOver;
let nextTetromino;

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = playfield.length - 1; y > 0; --y) {
        for (let x = 0; x < playfield[y].length; ++x) {
            if (playfield[y][x] === 0) {
                continue outer;
            }
        }

        const row = playfield.splice(y, 1)[0].fill(0);
        playfield.unshift(row);
        ++y;

        lines++;
        score += rowCount * 10;
        rowCount *= 2;
        if (lines > 0 && lines % 10 === 0) {
           level++;
           dropInterval = Math.max(200, 1000 - (level * 50));
        }
    }
}

function createPlayfield() {
    return Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

let dropCounter = 0;
let dropInterval = 1000; // ms
const dropIntervalSoftDrop = 50; // ms for soft drop
let currentDropInterval = dropInterval;

function playerDrop() {
    if (gameOver) return;
    player.pos.y++;
    if (collide(playfield, player)) {
        player.pos.y--;
        merge(playfield, player);
        playerReset();
        arenaSweep();
        updateScore();
        // Reset drop counter after piece lands
        dropCounter = 0;
        return true; // Indicate that a piece landed
    }
    // Only reset drop counter if not soft dropping.
    // If soft dropping, playerDrop is called more often, so this reset is not needed
    // and would interfere with continuous drop.
    if (currentDropInterval === dropInterval) {
        dropCounter = 0;
    }
    return false;
}

function playerMove(dir) {
    if (gameOver) return;
    player.pos.x += dir;
    if (collide(playfield, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    if (gameOver) return;
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(playfield, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function update(time = 0) {
    if (!gameOver) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > currentDropInterval) { // Use currentDropInterval here
            playerDrop();
        }

        draw();
        rAF = requestAnimationFrame(update);
    } else {
        drawGameOver();
        cancelAnimationFrame(rAF);
    }
}


function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function draw() {
    // Draw background
    context.fillStyle = COLORS.lightest;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (playfield) {
        // Draw playfield
        drawMatrix(playfield, {x: 0, y: 0}, context);

        // Draw player piece
        if (player) {
            drawMatrix(player.matrix, player.pos, context);
        }
    }
    
    // Draw next piece
    nextContext.fillStyle = COLORS.lightest;
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if(nextTetromino) {
        const matrix = TETROMINOES[nextTetromino];
        const x = (4 - matrix[0].length) / 2;
        const y = (4 - matrix.length) / 2;
        const offset = { x, y };
        drawMatrix(matrix, offset, nextContext);
    }
}

function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = COLORS.darkest;
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);

                // Add simple 3D effect
                ctx.fillStyle = COLORS.dark;
                ctx.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.8, 0.8);
                
                ctx.fillStyle = COLORS.light;
                ctx.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.6, 0.1);
                ctx.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.1, 0.6);

                 ctx.fillStyle = COLORS.darkest;
                 ctx.fillRect(x + offset.x + 0.7, y + offset.y + 0.7, 0.2, 0.2);
            }
        });
    });
}

function drawGameOver() {
    context.fillStyle = 'rgba(0,0,0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '24px "Press Start 2P"';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

function init() {
    context.fillStyle = COLORS.lightest;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '16px "Press Start 2P"';
    context.fillStyle = COLORS.darkest;
    context.textAlign = 'center';
    context.fillText('Press Start', canvas.width / 2, canvas.height / 2);
}

function startGame() {
    playfield = createPlayfield();
    score = 0;
    lines = 0;
    level = 0;
    gameOver = false;
    lastTime = 0;
    dropInterval = 1000;
    
    playerReset();
    updateScore();
    
    if (rAF) {
        cancelAnimationFrame(rAF);
    }
    rAF = requestAnimationFrame(update);
    
    startButton.textContent = "Restart";
}

const pieceBag = [];
function getNextTetromino() {
    if (pieceBag.length === 0) {
        // Refill the bag
        const pieces = 'TJLOSZI';
        let a = pieces.split('');
        // Shuffle
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        a.forEach(p => pieceBag.push(p));
    }
    return pieceBag.pop();
}


function playerReset() {
    
    if(!nextTetromino) {
        nextTetromino = getNextTetromino();
    }
    
    player = {
        pos: {x: 3, y: 0},
        matrix: TETROMINOES[nextTetromino],
    };
    
    nextTetromino = getNextTetromino();
    
    if (collide(playfield, player)) {
        gameOver = true;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function updateScore() {
    scoreElement.innerText = score;
    linesElement.innerText = lines;
    levelElement.innerText = level;
}


startButton.addEventListener('click', startGame);

leftButton.addEventListener('click', () => playerMove(-1));
rightButton.addEventListener('click', () => playerMove(1));

downButton.addEventListener('mousedown', () => currentDropInterval = dropIntervalSoftDrop);
downButton.addEventListener('mouseup', () => currentDropInterval = dropInterval);
downButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior like scrolling
    currentDropInterval = dropIntervalSoftDrop;
});
downButton.addEventListener('touchend', () => currentDropInterval = dropInterval);

upButton.addEventListener('click', () => playerRotate(1));
aButton.addEventListener('click', () => playerRotate(1));
bButton.addEventListener('click', () => playerRotate(-1));

document.addEventListener('keydown', event => {
    if (!gameOver) {
        if (event.code === 'ArrowLeft') {
            playerMove(-1);
        } else if (event.code === 'ArrowRight') {
            playerMove(1);
        } else if (event.code === 'ArrowDown') {
            currentDropInterval = dropIntervalSoftDrop;
        } else if (event.code === 'ArrowUp') {
            // Rotate
            playerRotate(1);
        }  else if (event.code === 'KeyQ') {
            // Rotate counter-clockwise
            playerRotate(-1);
        }
    }
});

document.addEventListener('keyup', event => {
    if (!gameOver) {
        if (event.code === 'ArrowDown') {
            currentDropInterval = dropInterval;
        }
    }
});

init();


