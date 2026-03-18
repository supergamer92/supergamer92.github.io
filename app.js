let cookieCount = 0;
let autoClickers = 0;
let grandmas = 0;

const cookieElement = document.getElementById('cookie');
const cookieCountElement = document.getElementById('cookie-count');
const clickerUpgradeElement = document.getElementById('upgrade-clicker-btn');
const grandmaUpgradeElement = document.getElementById('upgrade-grandma-btn');
const autoClickerDisplay = document.getElementById('auto-clicker-count');
const grandmaDisplay = document.getElementById('grandma-count');

// --- Game Configuration ---
const upgradeCosts = {
    clicker: 10,
    grandma: 100
};

const upgradeRates = {
    clicker: 1, // cookies per second
    grandma: 10 // cookies per second
};

// --- Game Logic ---

function bakeCookie() {
    cookieCount++;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    cookieCountElement.textContent = cookieCount;
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
                upgradeCosts.clicker = Math.ceil(cost * 1.15); // Increase cost for next upgrade
                updateAutoClickerDisplay();
                updateScoreDisplay();
            } else {
                alert('Not enough cookies!');
            }
            break;
        case 'grandma':
            cost = upgradeCosts.grandma;
            if (cookieCount >= cost) {
                cookieCount -= cost;
                grandmas++;
                upgradeCosts.grandma = Math.ceil(cost * 1.15); // Increase cost for next upgrade
                updateGrandmaDisplay();
                updateScoreDisplay();
            } else {
                alert('Not enough cookies!');
            }
            break;
    }
}

function updateAutoClickerDisplay() {
    autoClickerDisplay.textContent = autoClickers;
    document.getElementById('upgrade-clicker-cost').textContent = upgradeCosts.clicker;
}

function updateGrandmaDisplay() {
    grandmaDisplay.textContent = grandmas;
    document.getElementById('upgrade-grandma-cost').textContent = upgradeCosts.grandma;
}

function updateUpgradeButtons() {
    clickerUpgradeElement.disabled = cookieCount < upgradeCosts.clicker;
    grandmaUpgradeElement.disabled = cookieCount < upgradeCosts.grandma;
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
        upgradeCosts
    }));
}

function loadGame() {
    const savedGame = localStorage.getItem('cookieClickerGame');
    if (savedGame) {
        const parsedGame = JSON.parse(savedGame);
        cookieCount = parsedGame.cookieCount;
        autoClickers = parsedGame.autoClickers;
        grandmas = parsedGame.grandmas;
        upgradeCosts = parsedGame.upgradeCosts;
    }
    updateScoreDisplay();
    updateAutoClickerDisplay();
    updateGrandmaDisplay();
    updateUpgradeButtons();
}

// --- Event Listeners ---

cookieElement.addEventListener('click', () => {
    bakeCookie();
});

clickerUpgradeElement.addEventListener('click', () => {
    buyUpgrade('clicker');
});

grandmaUpgradeElement.addEventListener('click', () => {
    buyUpgrade('grandma');
});

// --- Initial Setup ---

loadGame(); // Load game on startup

// Start background production interval
setInterval(produceCookies, 1000);
