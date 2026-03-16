const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const COLS = 20;
const ROWS = 15;
canvas.width = TILE_SIZE * COLS;
canvas.height = TILE_SIZE * ROWS;

const gameState = {
    mode: 'EXPLORE',
    gold: 0,
    player: {
        x: 5, y: 5,
        hp: 100,
        maxHp: 100,
        inventory: ['Copper Sword', 'Health Potion'],
        isDefending: false
    },
    input: {},
    map: [],
    npc: { x: 10, y: 3, text: "Be careful! Slimes in the tall grass are smart!" },
    combat: {
        enemyHp: 60,
        enemyMaxHp: 60,
        enemyIsDefending: false,
        enemyHasPotion: true,
        turn: 'PLAYER', // PLAYER, ENEMY, RESOLUTION
        log: (msg) => { document.getElementById('combat-log').innerText = msg; }
    }
};

function initMap() {
    for (let y = 0; y < ROWS; y++) {
        gameState.map[y] = [];
        for (let x = 0; x < COLS; x++) {
            gameState.map[y][x] = (x === 0 || x === COLS-1 || y === 0 || y === ROWS-1) ? 1 : 0;
        }
    }
    gameState.map[7][7] = 1;
    gameState.map[7][8] = 1;
}

// Input Management
window.addEventListener('keydown', e => { gameState.input[e.code] = true; handleGlobalKeys(e.code); });
window.addEventListener('keyup', e => delete gameState.input[e.code]);

function handleGlobalKeys(code) {
    if (code === 'KeyI' && gameState.mode !== 'COMBAT') {
        const inv = document.getElementById('inventory');
        inv.classList.toggle('hidden');
        updateInventoryUI();
    }
    if (code === 'KeyE' && gameState.mode !== 'COMBAT') {
        if (gameState.mode === 'DIALOGUE') {
            gameState.mode = 'EXPLORE';
            document.getElementById('dialogue-box').classList.add('hidden');
        } else {
            checkInteraction();
        }
    }
}

function checkInteraction() {
    const dx = gameState.npc.x - gameState.player.x;
    const dy = gameState.npc.y - gameState.player.y;
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        gameState.mode = 'DIALOGUE';
        document.getElementById('dialogue-text').innerText = gameState.npc.text;
        document.getElementById('dialogue-box').classList.remove('hidden');
    }
}

// UI Updates
function updateHUD() {
    document.getElementById('hp-val').innerText = gameState.player.hp;
    document.getElementById('gold-val').innerText = gameState.gold;
}

function updateInventoryUI() {
    const list = document.getElementById('item-list');
    list.innerHTML = gameState.player.inventory.map(i => `<li>${i}</li>`).join('');
}

function updateCombatUI() {
    const percent = (gameState.combat.enemyHp / gameState.combat.enemyMaxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = percent + '%';
    document.getElementById('enemy-hp-text').innerText = `${gameState.combat.enemyHp}/${gameState.combat.enemyMaxHp}`;
    
    const btnHeal = document.getElementById('btn-heal');
    btnHeal.disabled = !gameState.player.inventory.includes('Health Potion');
}

function flickerEnemy() {
    const el = document.getElementById('enemy-render');
    el.classList.add('flicker');
    setTimeout(() => el.classList.remove('flicker'), 100);
}

// Combat System Logic
function startCombat() {
    gameState.mode = 'COMBAT';
    gameState.combat.enemyHp = 60;
    gameState.combat.enemyMaxHp = 60;
    gameState.combat.enemyHasPotion = true;
    gameState.combat.turn = 'PLAYER';
    gameState.combat.enemyIsDefending = false;
    gameState.player.isDefending = false;
    document.getElementById('combat-overlay').classList.remove('hidden');
    gameState.combat.log("A Slime Boss blocks your path!");
    updateCombatUI();
}

gameState.combat.playerAction = (type) => {
    if (gameState.combat.turn !== 'PLAYER') return;
    
    gameState.player.isDefending = false;

    if (type === 'ATTACK') {
        let dmg = Math.floor(Math.random() * 12) + 8;
        if (gameState.combat.enemyIsDefending) dmg = Math.floor(dmg / 2);
        gameState.combat.enemyHp = Math.max(0, gameState.combat.enemyHp - dmg);
        gameState.combat.log(`You attack for ${dmg} damage!`);
        flickerEnemy();
    } else if (type === 'DEFEND') {
        gameState.player.isDefending = true;
        gameState.combat.log("You take a defensive stance.");
    } else if (type === 'HEAL') {
        const idx = gameState.player.inventory.indexOf('Health Potion');
        gameState.player.inventory.splice(idx, 1);
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 30);
        gameState.combat.log("You used a Potion! Health restored.");
        updateHUD();
    }

    updateCombatUI();
    if (gameState.combat.enemyHp <= 0) {
        endCombat(true);
    } else {
        gameState.combat.turn = 'ENEMY';
        setTimeout(processEnemyTurn, 1000);
    }
};

function processEnemyTurn() {
    gameState.combat.enemyIsDefending = false;
    const eHpPerc = gameState.combat.enemyHp / gameState.combat.enemyMaxHp;
    const pHpPerc = gameState.player.hp / gameState.player.maxHp;
    
    let action = 'ATTACK';
    const roll = Math.random();

    // AI Logic Tree
    if (eHpPerc < 0.2 && gameState.combat.enemyHasPotion) {
        action = 'HEAL';
    } else if (eHpPerc < 0.2 && roll < 0.5) {
        action = 'DEFEND';
    } else if (pHpPerc < 0.15 && roll < 0.8) {
        action = 'ATTACK'; // Finish player
    } else {
        action = roll < 0.7 ? 'ATTACK' : 'DEFEND';
    }

    // Execute AI Action
    if (action === 'ATTACK') {
        let dmg = Math.floor(Math.random() * 10) + 5;
        if (gameState.player.isDefending) dmg = Math.floor(dmg / 2);
        gameState.player.hp = Math.max(0, gameState.player.hp - dmg);
        gameState.combat.log(`Enemy attacks! You take ${dmg} damage.`);
        updateHUD();
    } else if (action === 'DEFEND') {
        gameState.combat.enemyIsDefending = true;
        gameState.combat.log("The Enemy is guarding.");
    } else if (action === 'HEAL') {
        gameState.combat.enemyHp = Math.min(gameState.combat.enemyMaxHp, gameState.combat.enemyHp + 20);
        gameState.combat.enemyHasPotion = false;
        gameState.combat.log("Enemy drinks a weird green liquid and heals!");
        updateCombatUI();
    }

    if (gameState.player.hp <= 0) {
        gameState.combat.log("You were defeated...");
        setTimeout(() => location.reload(), 2000);
    } else {
        gameState.combat.turn = 'PLAYER';
    }
}

function endCombat(win) {
    if (win) {
        const rewardGold = Math.floor(Math.random() * 41) + 10;
        gameState.gold += rewardGold;
        let msg = `Victory! Gained ${rewardGold} gold.`;
        
        if (Math.random() < 0.5) {
            const loot = ['Health Potion', 'Steel Scrap', 'Magic Dust'][Math.floor(Math.random()*3)];
            gameState.player.inventory.push(loot);
            msg += ` Found: ${loot}!`;
        }
        
        gameState.combat.log(msg);
        updateHUD();
    }
    
    setTimeout(() => {
        gameState.mode = 'EXPLORE';
        document.getElementById('combat-overlay').classList.add('hidden');
    }, 1500);
}

// World Logic
let lastMove = 0;
function update() {
    if (gameState.mode !== 'EXPLORE') return;

    const now = Date.now();
    if (now - lastMove < 150) return;

    let nx = gameState.player.x;
    let ny = gameState.player.y;

    if (gameState.input['ArrowUp'] || gameState.input['KeyW']) ny--;
    else if (gameState.input['ArrowDown'] || gameState.input['KeyS']) ny++;
    else if (gameState.input['ArrowLeft'] || gameState.input['KeyA']) nx--;
    else if (gameState.input['ArrowRight'] || gameState.input['KeyD']) nx++;

    if (nx !== gameState.player.x || ny !== gameState.player.y) {
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && gameState.map[ny][nx] === 0) {
            gameState.player.x = nx;
            gameState.player.y = ny;
            lastMove = now;
            if (Math.random() < 0.04) startCombat();
        }
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    for(let y=0; y<ROWS;y++) {
        for(let x=0; x<COLS;x++) {
            ctx.fillStyle = gameState.map[y][x] === 1 ? '#333' : '#1a4d1a';
            ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    ctx.fillStyle = 'blue';
    ctx.fillRect(gameState.npc.x*TILE_SIZE+4, gameState.npc.y*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8);

    ctx.fillStyle = 'red';
    ctx.fillRect(gameState.player.x*TILE_SIZE+4, gameState.player.y*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8);

    update();
    requestAnimationFrame(draw);
}

initMap();
updateHUD();
draw();