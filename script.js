const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const VIEW_COLS = 20;
const VIEW_ROWS = 15;
const MAP_SIZE = 50;
canvas.width = TILE_SIZE * VIEW_COLS;
canvas.height = TILE_SIZE * VIEW_ROWS;

const BIOMES = {
    WATER: { id: 0, color: '#1a4e66', speed: 0.2, solid: true },
    GRASS: { id: 1, color: '#4a7a3e', speed: 1.0, solid: false },
    FOREST: { id: 2, color: '#2d4d23', speed: 0.6, solid: false },
    MOUNTAIN: { id: 3, color: '#5a5a5a', speed: 0.4, solid: true }
};

const gameState = {
    mode: 'EXPLORE',
    gold: 0, exp: 0, level: 1,
    player: {
        x: 25, y: 25, hp: 100, maxHp: 100, st: 100, maxSt: 100,
        att: 10, inventory: ['Health Potion', 'Rusty Blade'],
        isDefending: false
    },
    input: {}, map: [], npc: { x: 28, y: 28, text: "Greetings traveler! Beware the thick woods." },
    combat: { enemyHp: 0, enemyMaxHp: 0, turn: 'PLAYER', log: (m) => { document.getElementById('combat-log').innerText = m; } }
};

function initMap() {
    // Cellular Automata Like Generation
    let grid = Array(MAP_SIZE).fill().map(() => Array(MAP_SIZE).fill(1));
    
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            let r = Math.random();
            if (r < 0.1) grid[y][x] = 0; // Water blobs
            else if (r < 0.25) grid[y][x] = 2; // Forest blobs
            else if (r < 0.3) grid[y][x] = 3; // Mountain blobs
            else grid[y][x] = 1; // Grass
        }
    }
    gameState.map = grid;
    // Ensure spawn is grass
    gameState.map[25][25] = 1;
}

// Input Management
window.addEventListener('keydown', e => { gameState.input[e.code] = true; handleGlobalKeys(e.code); });
window.addEventListener('keyup', e => delete gameState.input[e.code]);

function handleGlobalKeys(code) {
    if (code === 'KeyI' && gameState.mode !== 'COMBAT') {
        document.getElementById('inventory').classList.toggle('hidden');
        updateInventoryUI();
    }
    if (code === 'KeyE' && gameState.mode !== 'COMBAT') {
        if (gameState.mode === 'DIALOGUE') {
            gameState.mode = 'EXPLORE';
            document.getElementById('dialogue-box').classList.add('hidden');
        } else {
            const dx = Math.abs(gameState.npc.x - gameState.player.x);
            const dy = Math.abs(gameState.npc.y - gameState.player.y);
            if (dx <= 1 && dy <= 1) {
                gameState.mode = 'DIALOGUE';
                document.getElementById('dialogue-text').innerText = gameState.npc.text;
                document.getElementById('dialogue-box').classList.remove('hidden');
            }
        }
    }
}

function updateHUD() {
    document.getElementById('hp-val').innerText = Math.round(gameState.player.hp);
    document.getElementById('hp-max').innerText = gameState.player.maxHp;
    document.getElementById('gold-val').innerText = gameState.gold;
    document.getElementById('exp-val').innerText = gameState.exp;
    document.getElementById('lvl-val').innerText = gameState.level;
    document.getElementById('stamina-bar').style.width = (gameState.player.st / gameState.player.maxSt) * 100 + '%';
}

function updateInventoryUI() {
    const list = document.getElementById('item-list');
    list.innerHTML = gameState.player.inventory.map(i => `<li>📜 ${i}</li>`).join('');
}

function startCombat() {
    gameState.mode = 'COMBAT';
    gameState.combat.enemyMaxHp = 40 + (gameState.level * 20);
    gameState.combat.enemyHp = gameState.combat.enemyMaxHp;
    gameState.combat.turn = 'PLAYER';
    document.getElementById('combat-overlay').classList.remove('hidden');
    gameState.combat.log("A dark entity approaches...");
    updateCombatUI();
}

function updateCombatUI() {
    const perc = (gameState.combat.enemyHp / gameState.combat.enemyMaxHp) * 100;
    document.getElementById('enemy-hp-bar').style.width = perc + '%';
    document.getElementById('btn-heal').disabled = !gameState.player.inventory.includes('Health Potion');
    document.getElementById('exhausted-msg').classList.toggle('hidden', gameState.player.st > 0);
}

gameState.combat.playerAction = (type) => {
    if (gameState.combat.turn !== 'PLAYER') return;
    gameState.player.isDefending = false;

    if (type === 'ATTACK') {
        if (gameState.player.st < 20) {
             gameState.combat.log("You are too tired to strike effectively!");
        }
        let power = gameState.player.att;
        if (gameState.player.st <= 0) power *= 0.5;
        
        let dmg = Math.floor(Math.random() * power) + 5;
        gameState.combat.enemyHp -= dmg;
        gameState.player.st = Math.max(0, gameState.player.st - 25);
        gameState.combat.log(`Thy blade deals ${dmg} damage!`);
        flickerEffect();
    } else if (type === 'DEFEND') {
        gameState.player.isDefending = true;
        gameState.player.st = Math.min(gameState.player.maxSt, gameState.player.st + 40);
        gameState.combat.log("You prepare for the onslaught, recovering breath.");
    } else if (type === 'HEAL') {
        const idx = gameState.player.inventory.indexOf('Health Potion');
        gameState.player.inventory.splice(idx, 1);
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 40);
        gameState.combat.log("Healing nectar mends thy wounds.");
    }

    updateHUD();
    updateCombatUI();

    if (gameState.combat.enemyHp <= 0) {
        endCombat(true);
    } else {
        gameState.combat.turn = 'ENEMY';
        setTimeout(processEnemyTurn, 800);
    }
};

function processEnemyTurn() {
    let dmg = Math.floor(Math.random() * 10) + 5 + gameState.level;
    if (gameState.player.isDefending) dmg = Math.floor(dmg / 2);
    
    gameState.player.hp -= dmg;
    gameState.combat.log(`The creature strikes for ${dmg} damage.`);
    
    updateHUD();
    if (gameState.player.hp <= 0) {
        alert("Thy journey ends here.");
        location.reload();
    } else {
        gameState.combat.turn = 'PLAYER';
    }
}

function flickerEffect() {
    const el = document.getElementById('enemy-render');
    el.classList.add('flicker');
    setTimeout(() => el.classList.remove('flicker'), 150);
}

function endCombat(win) {
    if (win) {
        let g = 10 + Math.floor(Math.random() * 30);
        let e = 20 + Math.floor(Math.random() * 20);
        gameState.gold += g;
        gameState.exp += e;
        gameState.combat.log(`Victory! Gained ${g} gold and ${e} EXP.`);
        
        if (gameState.exp >= gameState.level * 100) {
            gameState.level++;
            gameState.player.maxHp += 20;
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.att += 5;
            gameState.combat.log("Level increased! Strength flows within.");
        }
        updateHUD();
    }
    setTimeout(() => {
        gameState.mode = 'EXPLORE';
        document.getElementById('combat-overlay').classList.add('hidden');
    }, 1500);
}

// Game Loop
let lastMove = 0;
function update() {
    if (gameState.mode !== 'EXPLORE') return;

    const now = Date.now();
    const currentTile = gameState.map[gameState.player.y][gameState.player.x];
    let biome = Object.values(BIOMES).find(b => b.id === currentTile);
    let moveDelay = 150 / biome.speed;

    if (now - lastMove < moveDelay) return;

    let nx = gameState.player.x;
    let ny = gameState.player.y;

    if (gameState.input['ArrowUp'] || gameState.input['KeyW']) ny--;
    else if (gameState.input['ArrowDown'] || gameState.input['KeyS']) ny++;
    else if (gameState.input['ArrowLeft'] || gameState.input['KeyA']) nx--;
    else if (gameState.input['ArrowRight'] || gameState.input['KeyD']) nx++;

    if (nx !== gameState.player.x || ny !== gameState.player.y) {
        if (nx >=0 && nx < MAP_SIZE && ny >=0 && ny < MAP_SIZE) {
            let targetTile = gameState.map[ny][nx];
            let targetBiome = Object.values(BIOMES).find(b => b.id === targetTile);
            if (!targetBiome.solid) {
                gameState.player.x = nx;
                gameState.player.y = ny;
                lastMove = now;
                // Recovery stamina while walking if not exhausted
                gameState.player.st = Math.min(gameState.player.maxSt, gameState.player.st + 2);
                updateHUD();
                if (Math.random() < 0.03) startCombat();
            }
        }
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Camera logic
    const camX = Math.max(0, Math.min(MAP_SIZE - VIEW_COLS, gameState.player.x - Math.floor(VIEW_COLS/2)));
    const camY = Math.max(0, Math.min(MAP_SIZE - VIEW_ROWS, gameState.player.y - Math.floor(VIEW_ROWS/2)));

    // Draw level
    for (let y = 0; y < VIEW_ROWS; y++) {
        for (let x = 0; x < VIEW_COLS; x++) {
            let worldX = camX + x;
            let worldY = camY + y;
            let tileType = gameState.map[worldY][worldX];
            let b = Object.values(BIOMES).find(bi => bi.id === tileType);
            ctx.fillStyle = b.color;
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Draw NPC
    if (gameState.npc.x >= camX && gameState.npc.x < camX+VIEW_COLS && 
        gameState.npc.y >= camY && gameState.npc.y < camY+VIEW_ROWS) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect((gameState.npc.x - camX) * TILE_SIZE + 4, (gameState.npc.y - camY) * TILE_SIZE + 4, TILE_SIZE-8, TILE_SIZE-8);
    }

    // Draw Player (Centered relative to camera)
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 10;
    ctx.shadowColor = "gold";
    ctx.fillRect((gameState.player.x - camX) * TILE_SIZE + 6, (gameState.player.y - camY) * TILE_SIZE + 6, TILE_SIZE-12, TILE_SIZE-12);
    ctx.shadowBlur = 0;

    update();
    requestAnimationFrame(draw);
}

initMap();
updateHUD();
draw();