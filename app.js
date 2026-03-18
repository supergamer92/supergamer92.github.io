let cookieCount = 0;
const cookieElement = document.getElementById('cookie');
const cookieCountElement = document.getElementById('cookie-count');

// --- Game Logic ---

function bakeCookie() {
    cookieCount++;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    cookieCountElement.textContent = cookieCount;
}

// --- Event Listeners ---

cookieElement.addEventListener('click', () => {
    bakeCookie();
});

// --- Initial Setup ---

// Initialize display on load
updateScoreDisplay();
