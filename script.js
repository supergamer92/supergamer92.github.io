const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const gameOverStats = document.getElementById('game-over-stats');
const finalScoreEl = document.getElementById('final-score');

const gridSize = 20;
let tileCount;
let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let pulseAmount = 0;

highScoreEl.textContent = highScore;

function setup() {
    canvas.width = 400;
    canvas.height = 400;
    tileCount = canvas.width / gridSize;
    resetGame();
    drawGrid(); // Initial draw
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
    gameOverStats.classList.add('hidden');
    resetGame();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 100);
}

function screenShake() {
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 300);
}

function gameStep() {
    moveSnake();
    
    if (checkGameOver()) {
        clearInterval(gameLoop);
        finalScoreEl.textContent = score;
        gameOverStats.classList.remove('hidden');
        overlay.classList.remove('hidden');
        startBtn.textContent = 'REBOOT SYSTEM';
        screenShake();
        return;
    }

    checkFoodCollision();
    draw();
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) placeFood();
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function draw() {
    // Clear Canvas with slight fade for trail effect
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();

    // Draw Food (Pulsing Neon Circle)
    pulseAmount += 0.1;
    const pulse = Math.sin(pulseAmount) * 3;
    ctx.shadowBlur = 15 + pulse;
    ctx.shadowColor = '#ff0055';
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, (gridSize/2 - 4) + pulse/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((part, index) => {
        const ratio = index / snake.length;
        // Gradient from #00ffff to #004444
        ctx.fillStyle = `rgb(0, ${255 - (ratio * 150)}, ${255 - (ratio * 150)})`;
        ctx.shadowBlur = index === 0 ? 15 : 5;
        ctx.shadowColor = '#00ffff';
        
        // Rounded Rectangle for segments
        const r = 5;
        const x = part.x * gridSize + 2;
        const y = part.y * gridSize + 2;
        const w = gridSize - 4;
        const h = gridSize - 4;
        
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    });
    ctx.shadowBlur = 0;
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
        
        const tail = { ...snake[snake.length - 1] };
        snake.push(tail);
        placeFood();
        screenShake(); // Shake on eat
    }
}

function checkGameOver() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown': case 's': case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft': case 'a': case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight': case 'd': case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

startBtn.addEventListener('click', startGame);
setup();