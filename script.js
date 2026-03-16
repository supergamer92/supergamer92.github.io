const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const gameOverStats = document.getElementById('game-over-stats');
const finalScoreEl = document.getElementById('final-score');
const gameTitle = document.getElementById('game-title');
const statBoxes = document.querySelectorAll('.stat-box');

const gridSize = 20;
let tileCount;
let snake = [];
let particles = [];
let food = { x: 5, y: 5 };
let dx = 0, dy = 0;
let nextDirection = { x: 0, y: -1 };
let currentDirection = { x: 0, y: -1 };
let score = 0, highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let pulseAmount = 0;
let currentSpeed = 100;
let level = 1;

highScoreEl.textContent = highScore;

function setup() {
    canvas.width = 400;
    canvas.height = 400;
    tileCount = canvas.width / gridSize;
    resetGame();
    draw();
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0; dy = -1;
    nextDirection = { x: 0, y: -1 };
    currentDirection = { x: 0, y: -1 };
    score = 0; scoreEl.textContent = score;
    level = 1; levelEl.textContent = level;
    currentSpeed = 100;
    placeFood();
    particles = [];
}

function startGame() {
    overlay.classList.add('hidden');
    gameOverStats.classList.add('hidden');
    resetGame();
    scheduleNextStep();
}

function scheduleNextStep() {
    if (gameLoop) clearTimeout(gameLoop);
    gameLoop = setTimeout(gameStep, currentSpeed);
}

function createParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x * gridSize + gridSize / 2,
            y: y * gridSize + gridSize / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: '#ff00ff'
        });
    }
}

function triggerUIPulse() {
    gameTitle.classList.add('pulse-ui');
    statBoxes.forEach(box => box.classList.add('pulse-ui'));
    canvas.classList.add('shake');
    setTimeout(() => {
        gameTitle.classList.remove('pulse-ui');
        statBoxes.forEach(box => box.classList.remove('pulse-ui'));
        canvas.classList.remove('shake');
    }, 200);
}

function gameStep() {
    dx = nextDirection.x;
    dy = nextDirection.y;
    currentDirection = { x: dx, y: dy };

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || 
        snake.some(part => part.x === head.x && part.y === head.y)) {
        handleGameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10; 
        scoreEl.textContent = score;
        
        // Dynamic Difficulty Scaling
        level = Math.floor(score / 50) + 1;
        levelEl.textContent = level;
        currentSpeed = Math.max(40, 100 - (Math.floor(score / 10) * 2));

        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        createParticles(food.x, food.y);
        placeFood();
        triggerUIPulse();
    } else {
        snake.pop();
    }

    draw();
    scheduleNextStep();
}

function handleGameOver() {
    clearTimeout(gameLoop);
    finalScoreEl.textContent = score;
    gameOverStats.classList.remove('hidden');
    overlay.classList.remove('hidden');
    startBtn.textContent = 'REBOOT SYSTEM';
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 300);
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    if (snake.some(part => part.x === food.x && part.y === food.y)) {
        placeFood();
    }
}

function draw() {
    ctx.globalCompositeOperation = 'source-over';
    
    // Dynamic background intensity based on snake length
    const energyFactor = Math.min(snake.length * 2, 80);
    ctx.fillStyle = `rgb(${energyFactor/4}, 5, ${energyFactor/8})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background Grid
    ctx.strokeStyle = '#003333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    ctx.globalCompositeOperation = 'lighter';

    // Food
    pulseAmount += 0.15;
    const glitch = Math.random() > 0.95 ? 10 : 0;
    const pulse = Math.sin(pulseAmount) * 4;
    ctx.shadowBlur = 20 + pulse + glitch;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, (gridSize / 2 - 5) + (glitch ? 2 : 0), 0, Math.PI * 2);
    ctx.fill();

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        ctx.fillStyle = `rgba(255, 0, 255, ${p.life})`;
        ctx.fillRect(p.x, p.y, 2, 2);
    }

    // Snake
    const energyBloom = Math.min(25 + (snake.length / 2), 50);
    snake.forEach((part, index) => {
        const ratio = index / snake.length;
        const x = part.x * gridSize + 2;
        const y = part.y * gridSize + 2;
        const size = gridSize - 4;

        ctx.shadowBlur = index === 0 ? energyBloom + 5 : energyBloom;
        ctx.shadowColor = '#00ffcc';
        ctx.fillStyle = `rgba(0, 255, 204, ${0.3 * (1 - ratio)})`;
        drawRoundedRect(x - 2, y - 2, size + 4, size + 4, 6);

        ctx.shadowBlur = 0;
        ctx.fillStyle = index === 0 ? '#00ffcc' : `rgba(0, 255, 204, ${1 - ratio})`;
        drawRoundedRect(x, y, size, size, 4);
    });
}

function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
}

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if ((key === 'arrowup' || key === 'w') && currentDirection.y !== 1) {
        nextDirection = { x: 0, y: -1 };
    } else if ((key === 'arrowdown' || key === 's') && currentDirection.y !== -1) {
        nextDirection = { x: 0, y: 1 };
    } else if ((key === 'arrowleft' || key === 'a') && currentDirection.x !== 1) {
        nextDirection = { x: -1, y: 0 };
    } else if ((key === 'arrowright' || key === 'd') && currentDirection.x !== -1) {
        nextDirection = { x: 1, y: 0 };
    }
});

startBtn.addEventListener('click', startGame);
setup();