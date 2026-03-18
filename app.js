const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('gameOver');

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 150; // milliseconds per frame
let lastRenderTime = 0;
let isGameOver = false;
let isPaused = false;

// Visual parameters
const SNAKE_COLOR_PRIMARY = '#00FF00'; // Vibrant green
const SNAKE_COLOR_SECONDARY = '#00CC00'; // Slightly darker green for contrast
const FOOD_COLOR_PRIMARY = '#FF00FF';   // Magenta for eye-popping food
const FOOD_COLOR_SECONDARY = '#CC00CC'; // Darker magenta
const BACKGROUND_COLOR = '#0a0a0a';     // Dark, deep background
const GRID_LINE_COLOR = 'rgba(0, 255, 0, 0.1)'; // Subtle green grid lines
const GLOW_COLOR = 'rgba(0, 255, 0, 0.6)';      // Soft green glow

function getRandomFoodPosition() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
        // Check if food spawns on snake
        if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            break;
        }
    }
    return newFood;
}

function drawGlowingRect(x, y, width, height, color1, color2, glowColor) {
    ctx.save();
    // Glow effect
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;

    // Gradient for segments
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;

    ctx.fillRect(x, y, width, height);

    // Subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    ctx.restore();
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < CANVAS_SIZE / GRID_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE + 0.5, 0);
        ctx.lineTo(i * GRID_SIZE + 0.5, CANVAS_SIZE);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE + 0.5);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE + 0.5);
        ctx.stroke();
    }
    ctx.restore();
}

function update(currentTime) {
    if (isGameOver) {
        gameOverMessage.style.display = 'block';
        return;
    }
    if (isPaused) {
        requestAnimationFrame(update);
        return;
    }

    const deltaTime = currentTime - lastRenderTime;
    if (deltaTime < gameSpeed) {
        requestAnimationFrame(update);
        return;
    }
    lastRenderTime = currentTime;

    moveSnake();
    checkCollisions();
    drawGame();

    requestAnimationFrame(update);
}

function moveSnake() {
    const head = { ...snake[0] };
    head.x += dx;
    head.y += dy;

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        food = getRandomFoodPosition();
        if (gameSpeed > 60) gameSpeed -= 2;
    } else {
        snake.pop();
    }
}

function checkCollisions() {
    const head = snake[0];

    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        isGameOver = true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            isGameOver = true;
            break;
        }
    }
}

function drawGame() {
    // Clear canvas with background color
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    drawGrid();

    // Draw snake segments with glow
    snake.forEach((segment, index) => {
        // Make head slightly different or larger for visual emphasis if desired
        const isHead = index === 0;
        drawGlowingRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE,
            isHead ? SNAKE_COLOR_PRIMARY : SNAKE_COLOR_SECONDARY,
            isHead ? SNAKE_COLOR_SECONDARY : SNAKE_COLOR_PRIMARY,
            GLOW_COLOR
        );
    });

    // Draw food with glow
    drawGlowingRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE,
        FOOD_COLOR_PRIMARY,
        FOOD_COLOR_SECONDARY,
        GLOW_COLOR
    );
}

function changeDirection(event) {
    const keyPressed = event.key;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    if (keyPressed === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = 1;
    }
    if (keyPressed === 'ArrowLeft' && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === 'ArrowRight' && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === ' ' && !isGameOver) {
        isPaused = !isPaused;
        if (!isPaused) {
            requestAnimationFrame(update);
        }
    }
    if (keyPressed === 'Enter') {
        restartGame();
    }
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    food = getRandomFoodPosition();
    gameSpeed = 150;
    isGameOver = false;
    isPaused = false;
    gameOverMessage.style.display = 'none';
    requestAnimationFrame(update);
}

document.addEventListener('keydown', changeDirection);

food = getRandomFoodPosition();
requestAnimationFrame(update);
