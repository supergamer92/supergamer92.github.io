const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');

const gridSize = 20;
let tileCount;
let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;

highScoreEl.textContent = highScore;

function setup() {
    canvas.width = 400;
    canvas.height = 400;
    tileCount = canvas.width / gridSize;
    resetGame();
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    score = 0;
    scoreEl.textContent = score;
    placeFood();
}

function startGame() {
    overlay.classList.add('hidden');
    resetGame();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, 100);
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // Ensure food doesn't spawn on snake body
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) placeFood();
    });
}

function draw() {
    moveSnake();
    
    if (checkGameOver()) {
        clearInterval(gameLoop);
        overlay.classList.remove('hidden');
        startBtn.textContent = 'Restart Game';
        return;
    }

    checkFoodCollision();

    // Clear Canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

    // Draw Snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach((part, index) => {
        if (index === 0) ctx.fillStyle = '#8bc34a'; // Head is lighter
        else ctx.fillStyle = '#4CAF50';
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    snake.pop();
}

function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Grow snake - add a tail segment at current tail position
        const tail = { ...snake[snake.length - 1] };
        snake.push(tail);
        placeFood();
    }
}

function checkGameOver() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

startBtn.addEventListener('click', startGame);

// Handle resize to stay responsive
window.addEventListener('resize', () => {
    // Canvas remains 400x400 internally, CSS handles scaling
});

setup();