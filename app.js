let cookieCount = 0;
let autoClickers = 0;
let grandmas = 0;
let cookieMultiplier = 1;
let totalClicks = 0;

const cookieElement = document.getElementById('cookie');
const cookieCountElement = document.getElementById('cookie-count');
const clickerUpgradeElement = document.getElementById('upgrade-clicker-btn');
const grandmaUpgradeElement = document.getElementById('upgrade-grandma-btn');
const autoClickerDisplay = document.getElementById('auto-clicker-count');
const grandmaDisplay = document.getElementById('grandma-count');
const cookieMultiplierDisplay = document.getElementById('cookie-multiplier');
const totalClicksDisplay = document.getElementById('total-clicks');
const productionRateDisplay = document.getElementById('production-rate');

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// --- Game Configuration ---
const upgradeCosts = {
    clicker: 10,
    grandma: 100,
    multiplier: 200
};

const upgradeRates = {
    clicker: 1,
    grandma: 10
};

// --- Sound Functions ---
function playClickSound() {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported, continue silently
    }
}

function playPurchaseSound() {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Audio not supported
    }
}

// --- Visual Feedback Functions ---
function createCookieEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = '+' + cookieMultiplier;
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    effect.style.position = 'absolute';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 800);
}

function showPurchaseFeedback(type) {
    const feedback = document.createElement('div');
    feedback.className = 'purchase-feedback';
    feedback.textContent = type === 'clicker' ? 'Auto Clicker Purchased!' : 'Grandma Hired!';
    feedback.style.position = 'fixed';
    feedback.style.top = '20px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1500);
}

// --- Game Logic ---
function bakeCookie(event) {
    const rect = cookieElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    cookieCount += cookieMultiplier;
    totalClicks++;
    
    playClickSound();
    createCookieEffect(event.clientX, event.clientY);
    updateScoreDisplay();
}

function updateScoreDisplay() {
    cookieCountElement.textContent = Math.floor(cookieCount).toLocaleString();
    totalClicksDisplay.textContent = totalClicks.toLocaleString();
    cookieMultiplierDisplay.textContent = cookieMultiplier;
    
    // Update production rate display
    const productionRate = (autoClickers * upgradeRates.clicker) + (grandmas * upgradeRates.grandma);
    productionRateDisplay.textContent = productionRate.toFixed(1);
    
    updateUpgradeButtons();
}

function buyUpgrade(type) {
    let cost = 0;
    switch (type) {
        case 'clicker':
            cost = upgradeCosts.clicker;
            if (cookieCount >= cost) {
                cookieCount -= cost;
                autoClickers++;
                upgradeCosts.clicker = Math.ceil(cost * 1.25);
                updateAutoClickerDisplay();
                updateScoreDisplay();
                
                playPurchaseSound();
                showPurchaseFeedback('clicker');
            } else {
                showInsufficientFunds();
            }
            break;
        case 'grandma':
            cost = upgradeCosts.grandma;
            if (cookieCount >= cost) {
                cookieCount -= cost;
                grandmas++;
                upgradeCosts.grandma = Math.ceil(cost * 1.3);
                updateGrandmaDisplay();
                updateScoreDisplay();
                
                playPurchaseSound();
                showPurchaseFeedback('grandma');
            } else {
                showInsufficientFunds();
            }
            break;
        case 'multiplier':
            cost = upgradeCosts.multiplier;
            if (cookieCount >= cost) {
                cookieCount -= cost;
                cookieMultiplier *= 2;
                upgradeCosts.multiplier = Math.ceil(cost * 3);
                updateMultiplierDisplay();
                updateScoreDisplay();
                
                playPurchaseSound();
                showPurchaseFeedback('multiplier');
            } else {
                showInsufficientFunds();
            }
            break;
    }
    saveGame();
}

function showInsufficientFunds() {
    const feedback = document.createElement('div');
    feedback.className = 'insufficient-funds';
    feedback.textContent = 'Not enough cookies!';
    feedback.style.position = 'fixed';
    feedback.style.top = '60px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1200);
}

function updateAutoClickerDisplay() {
    autoClickerDisplay.textContent = autoClickers;
    document.getElementById('upgrade-clicker-cost').textContent = upgradeCosts.clicker.toLocaleString();
}

function updateGrandmaDisplay() {
    grandmaDisplay.textContent = grandmas;
    document.getElementById('upgrade-grandma-cost').textContent = upgradeCosts.grandma.toLocaleString();
}

function updateMultiplierDisplay() {
    cookieMultiplierDisplay.textContent = cookieMultiplier;
    document.getElementById('upgrade-multiplier-cost').textContent = upgradeCosts.multiplier.toLocaleString();
}

function updateUpgradeButtons() {
    clickerUpgradeElement.disabled = cookieCount < upgradeCosts.clicker;
    grandmaUpgradeElement.disabled = cookieCount < upgradeCosts.grandma;
    document.getElementById('upgrade-multiplier-btn').disabled = cookieCount < upgradeCosts.multiplier;
}

// --- Background Production ---
function produceCookies() {
    cookieCount += autoClickers * upgradeRates.clicker;
    cookieCount += grandmas * upgradeRates.grandma;
    updateScoreDisplay();
}

// --- Persistence ---
function saveGame() {
    localStorage.setItem('cookieClickerGame', JSON.stringify({
        cookieCount,
        autoClickers,
        grandmas,
        cookieMultiplier,
        totalClicks,
        upgradeCosts
    }));
}

function loadGame() {
    const savedGame = localStorage.getItem('cookieClickerGame');
    if (savedGame) {
        try {
            const parsedGame = JSON.parse(savedGame);
            cookieCount = parsedGame.cookieCount || 0;
            autoClickers = parsedGame.autoClickers || 0;
            grandmas = parsedGame.grandmas || 0;
            cookieMultiplier = parsedGame.cookieMultiplier || 1;
            totalClicks = parsedGame.totalClicks || 0;
            upgradeCosts = parsedGame.upgradeCosts || {
                clicker: 10,
                grandma: 100,
                multiplier: 200
            };
        } catch (e) {
            console.log('Failed to load saved game');
        }
    }
    updateScoreDisplay();
    updateAutoClickerDisplay();
    updateGrandmaDisplay();
    updateMultiplierDisplay();
    updateUpgradeButtons();
}

// --- Event Listeners ---
cookieElement.addEventListener('click', bakeCookie);

clickerUpgradeElement.addEventListener('click', () => {
    buyUpgrade('clicker');
});

grandmaUpgradeElement.addEventListener('click', () => {
    buyUpgrade('grandma');
});

// Reset game button
const resetButton = document.createElement('button');
resetButton.id = 'reset-btn';
resetButton.textContent = 'Reset Game';
resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('cookieClickerGame');
        location.reload();
    }
});

document.querySelector('.game-container').appendChild(resetButton);

// --- Initial Setup ---
loadGame();

// Start background production interval with visual progress
setInterval(produceCookies, 1000);

// Auto-save every 10 seconds
setInterval(saveGame, 10000);

// Initialize multiplier button
const multiplierBtn = document.createElement('button');
multiplierBtn.id = 'upgrade-multiplier-btn';
multiplierBtn.textContent = 'Buy Cookie Multiplier';
multiplierBtn.addEventListener('click', () => {
    buyUpgrade('multiplier');
});

const multiplierInfo = document.createElement('span');
mul