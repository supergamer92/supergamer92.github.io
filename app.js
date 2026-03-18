// Pong - Canvas-based game implementation
// No external dependencies, no build step required

// Game state
const gameState = {
  running: false,
  paused: false,
  gameOver: false,
  playerScore: 0,
  aiScore: 0,
  winningScore: 5
};

// Canvas setup
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Logical resolution for consistent physics
const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 500;

// Scale factor for canvas rendering
function scaleContext() {
  const scaleX = canvas.width / LOGICAL_WIDTH;
  const scaleY = canvas.height / LOGICAL_HEIGHT;
  ctx.scale(scaleX, scaleY);
}

// Entities
const paddle = {
  x: 20,
  y: LOGICAL_HEIGHT / 2 - 40,
  width: 12,
  height: 80,
  color: '#ecf0f1',
  speed: 8,
  dy: 0
};

const aiPaddle = {
  x: LOGICAL_WIDTH - 32,
  y: LOGICAL_HEIGHT / 2 - 40,
  width: 12,
  height: 80,
  color: '#ecf0f1',
  speed: 6, // Slightly slower than player for fairness
  dy: 0
};

const ball = {
  x: LOGICAL_WIDTH / 2,
  y: LOGICAL_HEIGHT / 2,
  radius: 8,
  color: '#ecf0f1',
  speed: 6,
  dx: 6,
  dy: 6,
  minSpeed: 6,
  maxSpeed: 12,
  speedIncrement: 0.5
};

// Input tracking
const keys = { w: false, s: false, W: false, S: false };
let mouseY = null;

// DOM Elements
const uiStartBtn = document.getElementById('start-btn');
const uiRestartBtn = document.getElementById('restart-btn');
const uiMessage = document.getElementById('message-area');
const uiPlayerScore = document.getElementById('player-score');
const uiAiScore = document.getElementById('ai-score');

// Event Listeners
window.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W') keys.w = true;
  if (e.key === 's' || e.key === 'S') keys.s = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'W') keys.w = false;
  if (e.key === 's' || e.key === 'S') keys.s = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = LOGICAL_HEIGHT / rect.height;
  const canvasY = (e.clientY - rect.top) * scaleY;
  mouseY = canvasY;
});

uiStartBtn.addEventListener('click', startGame);
uiRestartBtn.addEventListener('click', resetGame);

// Game Control Functions
function startGame() {
  if (gameState.gameOver) {
    resetGame();
    return;
  }
  gameState.running = true;
  gameState.gameOver = false;
  uiStartBtn.classList.add('hidden');
  uiRestartBtn.classList.add('hidden');
  uiMessage.textContent = '';
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  gameState.playerScore = 0;
  gameState.aiScore = 0;
  gameState.gameOver = false;
  gameState.running = true;
  updateScoreDisplay();
  resetBall();
  uiStartBtn.classList.add('hidden');
  uiRestartBtn.classList.add('hidden');
  uiMessage.textContent = '';
  requestAnimationFrame(gameLoop);
}

function stopGame(message) {
  gameState.running = false;
  gameState.gameOver = true;
  uiMessage.textContent = message;
  uiRestartBtn.classList.remove('hidden');
}

function resetBall() {
  ball.x = LOGICAL_WIDTH / 2;
  ball.y = LOGICAL_HEIGHT / 2;
  ball.speed = ball.minSpeed;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
}

function updateScoreDisplay() {
  uiPlayerScore.textContent = gameState.playerScore;
  uiAiScore.textContent = gameState.aiScore;
}

// Physics Functions
function updatePaddles() {
  // Player paddle
  if (mouseY !== null) {
    paddle.y = mouseY - paddle.height / 2;
  } else {
    if (keys.w) paddle.y -= paddle.speed;
    if (keys.s) paddle.y += paddle.speed;
  }
  
  // Clamp player paddle
  paddle.y = Math.max(0, Math.min(LOGICAL_HEIGHT - paddle.height, paddle.y));

  // AI paddle
  const center = aiPaddle.y + aiPaddle.height / 2;
  if (center < ball.y - 10) {
    aiPaddle.y += aiPaddle.speed;
  } else if (center > ball.y + 10) {
    aiPaddle.y -= aiPaddle.speed;
  }
  
  // Clamp AI paddle
  aiPaddle.y = Math.max(0, Math.min(LOGICAL_HEIGHT - aiPaddle.height, aiPaddle.y));
}

function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top/bottom collision
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > LOGICAL_HEIGHT) {
    ball.dy = -ball.dy;
  }

  // Paddle collision detection
  // Player paddle
  if (
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y > paddle.y &&
    ball.y < paddle.y + paddle.height
  ) {
    // Calculate hit position relative to paddle center
    const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    
    // Increase speed and redirect ball
    ball.speed = Math.min(ball.speed + ball.speedIncrement, ball.maxSpeed);
    ball.dx = -ball.dx * Math.abs(ball.dx) / ball.dx; // preserve direction
    ball.dy = hitPos * ball.speed * 0.75;
    
    // Normalize ball velocity vector
    const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = (ball.dx / magnitude) * ball.speed;
    ball.dy = (ball.dy / magnitude) * ball.speed;
  }

  // AI paddle
  if (
    ball.x + ball.radius > aiPaddle.x &&
    ball.x - ball.radius < aiPaddle.x + aiPaddle.width &&
    ball.y > aiPaddle.y &&
    ball.y < aiPaddle.y + aiPaddle.height
  ) {
    const hitPos = (ball.y - (aiPaddle.y + aiPaddle.height / 2)) / (aiPaddle.height / 2);
    
    ball.speed = Math.min(ball.speed + ball.speedIncrement, ball.maxSpeed);
    ball.dx = -ball.dx * Math.abs(ball.dx) / ball.dx;
    ball.dy = hitPos * ball.speed * 0.75;
    
    const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.dx = (ball.dx / magnitude) * ball.speed;
    ball.dy = (ball.dy / magnitude) * ball.speed;
  }

  // Scoring
  if (ball.x < 0) {
    gameState.aiScore++;
    updateScoreDisplay();
    if (gameState.aiScore >= gameState.winningScore) {
      stopGame('AI Wins!');
    } else {
      resetBall();
    }
  } else if (ball.x > LOGICAL_WIDTH) {
    gameState.playerScore++;
    updateScoreDisplay();
    if (gameState.playerScore >= gameState.winningScore) {
      stopGame('You Win!');
    } else {
      resetBall();
    }
  }
}

// Rendering Functions
function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = '#7f8c8d';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(LOGICAL_WIDTH / 2, 0);
  ctx.lineTo(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  // Clear canvas
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  drawNet();
  drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
  drawRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height, aiPaddle.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Main Game Loop
function gameLoop() {
  if (!gameState.running) return;

  updatePaddles();
  updateBall();
  render();

  if (gameState.running) {
    requestAnimationFrame(gameLoop);
  }
}

// Initialize
scaleContext();
render();
