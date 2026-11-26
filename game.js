/**
 * SwordQuest — game.js
 * Engine platform-adventure ala Swordigo
 * Pure JavaScript (ES6+) + HTML5 Canvas 2D
 *
 * Fitur:
 *  - 3 Level dengan tile-map procedural
 *  - Pemain: gerak, lompat (double jump), serang, sihir, tameng
 *  - Musuh: Goblin, Skeleton, Boss
 *  - Koin, Potion HP, Potion MP
 *  - Sistem EXP / Level Up
 *  - Kamera scrolling
 *  - Particle effect & floating damage text
 *  - Full HUD + Overlay system
 */

'use strict';

// ═══════════════════════════════════════════════════════════
//  KONSTANTA
// ═══════════════════════════════════════════════════════════
const GRAVITY      = 0.55;
const MAX_FALL     = 18;
const TILE         = 40;         // ukuran tile px
const FPS_TARGET   = 60;

// Warna tema game
const C = {
  sky1:    '#060d2e', sky2: '#0f1f5c',
  ground1: '#3d2b1f', ground2: '#5c3d20',
  platform:'#5c3f1f',
  grass:   '#3a7d44',
  stone:   '#555577',
  player:  '#e8c97e',
  sword:   '#c0c0c0',
  goblin:  '#5a9e45',
  skel:    '#e0d9c5',
  boss:    '#8b0000',
  coin:    '#f5c518',
  potionH: '#e74c3c',
  potionM: '#3498db',
  gem:     '#9b59b6',
  fireball:'#ff6633',
  shield:  '#5dade2',
  particle:'#f5c518',
  bg_star: 'rgba(255,255,255,0.7)',
};

// ═══════════════════════════════════════════════════════════
//  LEVEL DATA
// ═══════════════════════════════════════════════════════════
// 0=air, 1=tanah, 2=platform, 3=stone, 9=spikes
const LEVELS = [
  // ─── LEVEL 1: Hutan Awal ───
  {
    name:   'Hutan Awal',
    width:  120,
    height: 15,
    bgColor:['#060d2e','#0d1d4a'],
    groundY: 11,
    map: generateLevel1(),
    enemies: [
      { type:'goblin',  tileX:20, tileY:10 },
      { type:'goblin',  tileX:32, tileY:10 },
      { type:'goblin',  tileX:50, tileY:10 },
      { type:'goblin',  tileX:65, tileY:10 },
      { type:'skeleton',tileX:78, tileY:10 },
      { type:'skeleton',tileX:88, tileY:10 },
      { type:'goblin',  tileX:95, tileY:7  },
      { type:'skeleton',tileX:105,tileY:10 },
    ],
    coins: genCoins(1),
    potions: genPotions(1),
    portal: { tileX:116, tileY:10 },
  },
  // ─── LEVEL 2: Gua Batu ───
  {
    name:   'Gua Batu',
    width:  140,
    height: 15,
    bgColor:['#0a0a0a','#1a1025'],
    groundY: 11,
    map: generateLevel2(),
    enemies: [
      { type:'goblin',  tileX:15, tileY:10 },
      { type:'skeleton',tileX:28, tileY:10 },
      { type:'skeleton',tileX:42, tileY:10 },
      { type:'goblin',  tileX:55, tileY:7  },
      { type:'skeleton',tileX:70, tileY:10 },
      { type:'skeleton',tileX:82, tileY:10 },
      { type:'goblin',  tileX:95, tileY:10 },
      { type:'skeleton',tileX:110,tileY:10 },
      { type:'skeleton',tileX:120,tileY:10 },
    ],
    coins: genCoins(2),
    potions: genPotions(2),
    portal: { tileX:136, tileY:10 },
  },
  // ─── LEVEL 3: Kastil Boss ───
  {
    name:   'Kastil Boss',
    width:  150,
    height: 15,
    bgColor:['#1a0000','#300010'],
    groundY: 11,
    map: generateLevel3(),
    enemies: [
      { type:'goblin',  tileX:15, tileY:10 },
      { type:'skeleton',tileX:25, tileY:10 },
      { type:'skeleton',tileX:38, tileY:10 },
      { type:'goblin',  tileX:50, tileY:7  },
      { type:'skeleton',tileX:62, tileY:10 },
      { type:'skeleton',tileX:75, tileY:10 },
      { type:'skeleton',tileX:88, tileY:10 },
      { type:'skeleton',tileX:100,tileY:10 },
      { type:'boss',    tileX:135,tileY:9  },
    ],
    coins: genCoins(3),
    potions: genPotions(3),
    portal: { tileX:146, tileY:10 },
  },
];

function generateLevel1() {
  const W = 120, H = 15, GY = 11;
  const map = Array.from({length:H}, () => Array(W).fill(0));
  // tanah
  for(let x=0;x<W;x++) for(let y=GY;y<H;y++) map[y][x]=1;
  // platforms
  const plats = [
    [10,9,4],[18,8,3],[25,7,4],[35,9,5],[45,8,3],[55,7,4],
    [63,9,3],[70,8,4],[80,7,3],[90,9,4],[100,8,3],[108,7,4]
  ];
  plats.forEach(([x,y,w])=>{for(let i=0;i<w;i++) map[y][x+i]=2;});
  // lubang
  [[14,2],[33,2],[60,2],[85,2]].forEach(([x,w])=>{
    for(let i=0;i<w;i++) for(let y=GY;y<H;y++) map[y][x+i]=0;
  });
  // stone wall
  for(let y=5;y<GY;y++) map[y][115]=3;
  for(let y=5;y<GY;y++) map[y][116]=3;
  return map;
}

function generateLevel2() {
  const W = 140, H = 15, GY = 11;
  const map = Array.from({length:H}, () => Array(W).fill(0));
  for(let x=0;x<W;x++) for(let y=GY;y<H;y++) map[y][x]=1;
  for(let x=0;x<W;x++) map[0][x]=3; // ceiling
  for(let x=0;x<W;x++) map[1][x]=3;
  const plats = [
    [8,9,3],[18,8,4],[30,7,3],[40,9,5],[52,8,3],[62,7,4],
    [72,9,3],[82,8,4],[92,7,3],[102,9,4],[112,8,3],[122,7,4],[130,9,3]
  ];
  plats.forEach(([x,y,w])=>{for(let i=0;i<w;i++) map[y][x+i]=2;});
  [[12,3],[35,2],[58,2],[80,3],[105,2],[128,2]].forEach(([x,w])=>{
    for(let i=0;i<w;i++) for(let y=GY;y<H;y++) map[y][x+i]=0;
  });
  return map;
}

function generateLevel3() {
  const W = 150, H = 15, GY = 11;
  const map = Array.from({length:H}, () => Array(W).fill(0));
  for(let x=0;x<W;x++) for(let y=GY;y<H;y++) map[y][x]=1;
  // dinding kastil
  for(let y=4;y<GY;y++) { map[y][0]=3; map[y][1]=3; }
  const plats = [
    [6,9,4],[15,8,3],[25,7,4],[35,9,4],[46,8,3],[58,7,4],
    [68,9,3],[78,8,4],[88,7,3],[98,9,4],[110,8,3],[120,7,4],
    [128,9,3],[130,7,8] // boss arena platform
  ];
  plats.forEach(([x,y,w])=>{for(let i=0;i<w;i++) map[y][x+i]=2;});
  [[10,2],[30,2],[52,2],[75,2],[100,2],[125,2]].forEach(([x,w])=>{
    for(let i=0;i<w;i++) for(let y=GY;y<H;y++) map[y][x+i]=0;
  });
  // boss arena walls
  for(let y=5;y<GY;y++) { map[y][130]=3; map[y][145]=3; map[y][146]=3; }
  return map;
}

function genCoins(lvl) {
  const coins = [];
  const xs = lvl===1 ? [8,15,22,36,46,56,66,76,86,96,106] :
             lvl===2 ? [6,16,25,38,50,64,74,86,96,108,118,128] :
                       [5,12,22,33,44,56,66,78,90,102,114,126,135,142];
  xs.forEach(x => coins.push({ tileX: x, tileY: 10, collected: false }));
  return coins;
}

function genPotions(lvl) {
  const p = [];
  const hpXs = lvl===1 ? [30,60,100] : lvl===2 ? [25,70,120] : [20,65,110];
  const mpXs = lvl===1 ? [45,85] : lvl===2 ? [40,95] : [35,90,130];
  hpXs.forEach(x => p.push({ tileX:x, tileY:10, type:'hp', collected:false }));
  mpXs.forEach(x => p.push({ tileX:x, tileY:10, type:'mp', collected:false }));
  return p;
}

// ═══════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════
const state = {
  screen:    'menu',    // menu|game|pause|gameover|levelclear|win
  level:     0,
  score:     0,
  coins:     0,
  frameId:   null,
  lastTime:  0,
  dt:        0,
  camera:    { x:0, y:0 },
  particles: [],
  floatTexts:[],
  stars:     [],
};

const player = {
  x: 80, y: 400,
  w: 28, h: 44,
  vx: 0, vy: 0,
  speed: 3.6,
  facing: 1,       // 1=kanan, -1=kiri
  onGround: false,
  jumpsLeft: 2,
  hp: 100, maxHp: 100,
  mp: 60,  maxMp: 60,
  exp: 0, expNext: 100,
  lvl: 1,
  attacking: false, attackTimer: 0, attackDur: 18, attackCd: 0,
  magicTimer: 0, magicDur: 0, magicCd: 0,
  shielding: false, shieldTimer: 0, shieldCd: 0,
  invincible: 0,
  deathAnim: 0,
  alive: true,
  animFrame: 0, animTimer: 0,
  walkCycle: 0,
};

const keys  = {};
const mouse = {};
let canvas, ctx;
let currentEnemies  = [];
let currentCoins    = [];
let currentPotions  = [];
let fireballs       = [];
let enemyProjectiles= [];
let currentMap      = null;
let levelData       = null;

// ═══════════════════════════════════════════════════════════
//  SCREEN MANAGER
// ═══════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) el.classList.add('active');
}
function showOverlay(id) {
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
  const el = document.getElementById('overlay-' + id);
  if (el) el.classList.remove('hidden');
}
function hideOverlays() {
  document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
}

// ═══════════════════════════════════════════════════════════
//  MENU PARTICLES
// ═══════════════════════════════════════════════════════════
function spawnMenuParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#f5c518','#9b59b6','#3498db','#e74c3c','#2ecc71','#c8aaff'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left     = Math.random() * 100 + '%';
    p.style.bottom   = '-10px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.width    = (3 + Math.random()*6) + 'px';
    p.style.height   = p.style.width;
    p.style.animationDuration  = (4 + Math.random()*8) + 's';
    p.style.animationDelay     = (Math.random()*8) + 's';
    container.appendChild(p);
  }
}

// ═══════════════════════════════════════════════════════════
//  CANVAS RESIZE
// ═══════════════════════════════════════════════════════════
function resizeCanvas() {
  if (!canvas) return;
  const hud  = document.getElementById('hud');
  const bar  = document.getElementById('skill-bar');
  const hudH = hud  ? hud.offsetHeight  : 56;
  const barH = bar  ? bar.offsetHeight  : 60;
  canvas.width  = window.innerWidth;
  canvas.height = Math.max(300, window.innerHeight - hudH - barH);
}

// ═══════════════════════════════════════════════════════════
//  LEVEL LOADER
// ═══════════════════════════════════════════════════════════
function loadLevel(idx) {
  levelData = LEVELS[idx];
  currentMap = levelData.map;

  // Clone enemies
  currentEnemies = levelData.enemies.map(e => createEnemy(e));
  // Clone coins
  currentCoins = levelData.coins.map(c => ({ ...c }));
  // Clone potions
  currentPotions = levelData.potions.map(p => ({ ...p }));
  // Clear projectiles
  fireballs        = [];
  enemyProjectiles = [];

  // Reset player position
  player.x = 2 * TILE;
  player.y = (levelData.groundY - 2) * TILE;
  player.vx = 0; player.vy = 0;
  player.onGround = false;
  player.jumpsLeft = 2;
  player.attacking = false; player.attackTimer = 0; player.attackCd = 0;
  player.magicTimer = 0; player.magicCd = 0;
  player.shielding = false; player.shieldCd = 0;
  player.invincible = 0;
  player.alive = true;
  player.deathAnim = 0;

  // Camera
  state.camera.x = 0;
  state.camera.y = 0;

  // Stars background
  state.stars = Array.from({length:80}, () => ({
    x: Math.random() * levelData.width * TILE,
    y: Math.random() * canvas.height * 0.6,
    r: Math.random() * 1.8 + 0.3,
    alpha: Math.random() * 0.6 + 0.3,
  }));

  // HUD
  updateHUD();
  document.getElementById('hud-level').textContent = idx + 1;
}

function createEnemy(cfg) {
  const isGoblin  = cfg.type === 'goblin';
  const isSkel    = cfg.type === 'skeleton';
  const isBoss    = cfg.type === 'boss';
  return {
    type:       cfg.type,
    x:          cfg.tileX * TILE,
    y:          (cfg.tileY - 1) * TILE,
    w:          isBoss ? 52 : 30,
    h:          isBoss ? 60 : 40,
    vx:         0,
    vy:         0,
    onGround:   false,
    hp:         isBoss ? 500 : isGoblin ? 40 : 70,
    maxHp:      isBoss ? 500 : isGoblin ? 40 : 70,
    speed:      isBoss ? 1.8 : isGoblin ? 1.3 : 1.0,
    facing:     -1,
    alive:      true,
    deathAnim:  0,
    attackCd:   0,
    projectileCd: isBoss ? 90 : (isSkel ? 150 : 0),
    aggro:      false,
    aggroRange: isBoss ? 450 : 220,
    patrolRange:isBoss ? 200 : 100,
    patrolOriginX: cfg.tileX * TILE,
    animTimer:  Math.random() * 60,
    stunTimer:  0,
    phase:      1,     // boss phases
  };
}

// ═══════════════════════════════════════════════════════════
//  TILE HELPERS
// ═══════════════════════════════════════════════════════════
function getTile(mx, my) {
  if (!currentMap) return 0;
  if (my < 0 || my >= currentMap.length) return 0;
  if (mx < 0 || mx >= currentMap[0].length) return 1; // solid edge
  return currentMap[my][mx];
}
function isSolid(t) { return t === 1 || t === 2 || t === 3; }

// AABB tile collision — returns {x,y,onGround,hitCeiling}
function resolveEntity(ent) {
  // Horizontal
  ent.x += ent.vx;
  const tiles = tilesOverlap(ent);
  for (const [tx,ty] of tiles) {
    if (!isSolid(getTile(tx,ty))) continue;
    const left   = tx * TILE;
    const right  = (tx+1) * TILE;
    if (ent.vx > 0 && ent.x + ent.w > left && ent.x < left) {
      ent.x = left - ent.w; ent.vx = 0;
    } else if (ent.vx < 0 && ent.x < right && ent.x + ent.w > right) {
      ent.x = right; ent.vx = 0;
    }
  }

  // Vertical
  ent.vy = Math.min(ent.vy + GRAVITY, MAX_FALL);
  ent.y += ent.vy;
  ent.onGround = false;
  const tiles2 = tilesOverlap(ent);
  for (const [tx,ty] of tiles2) {
    const t = getTile(tx,ty);
    if (!isSolid(t)) continue;
    const top    = ty * TILE;
    const bottom = (ty+1) * TILE;
    if (ent.vy > 0 && ent.y + ent.h > top && ent.y < top) {
      ent.y = top - ent.h; ent.vy = 0; ent.onGround = true;
    } else if (ent.vy < 0 && ent.y < bottom && ent.y + ent.h > bottom) {
      ent.y = bottom; ent.vy = 0;
    }
  }
}

function tilesOverlap(ent) {
  const result = [];
  const x1 = Math.floor(ent.x / TILE);
  const y1 = Math.floor(ent.y / TILE);
  const x2 = Math.floor((ent.x + ent.w - 1) / TILE);
  const y2 = Math.floor((ent.y + ent.h - 1) / TILE);
  for (let ty = y1; ty <= y2; ty++)
    for (let tx = x1; tx <= x2; tx++)
      result.push([tx, ty]);
  return result;
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ═══════════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════════
function setupInput() {
  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (!keys['_handled_' + e.key]) {
      keys['_handled_' + e.key] = true;
      handleKeyPress(e.key);
    }
  });
  document.addEventListener('keyup', e => {
    keys[e.key] = false;
    keys['_handled_' + e.key] = false;
  });

  // Pause button
  document.getElementById('btn-pause').addEventListener('click', togglePause);

  // Mobile
  const mc = {
    'mc-left':   ()=>{ keys['ArrowLeft']  = true; },
    'mc-right':  ()=>{ keys['ArrowRight'] = true; },
    'mc-jump':   ()=>{ doJump(); },
    'mc-attack': ()=>{ doAttack(); },
    'mc-magic':  ()=>{ doMagic(); },
    'mc-shield': ()=>{ player.shielding = true; },
  };
  Object.entries(mc).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', e => { e.preventDefault(); fn(); }, { passive:false });
    el.addEventListener('mousedown',  e => { e.preventDefault(); fn(); });
  });
  ['mc-left','mc-right'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = id === 'mc-left' ? 'ArrowLeft' : 'ArrowRight';
    el.addEventListener('touchend',   e => { e.preventDefault(); keys[key] = false; }, { passive:false });
    el.addEventListener('touchcancel',e => { e.preventDefault(); keys[key] = false; }, { passive:false });
    el.addEventListener('mouseup',    e => { keys[key] = false; });
  });
  document.getElementById('mc-shield').addEventListener('touchend', () => { player.shielding = false; });
  document.getElementById('mc-shield').addEventListener('mouseup',  () => { player.shielding = false; });
}

function handleKeyPress(key) {
  if (state.screen !== 'game') return;
  if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === ' ') doJump();
  if (key === 'z' || key === 'Z' || key === 'j' || key === 'J') doAttack();
  if (key === 'x' || key === 'X' || key === 'k' || key === 'K') doMagic();
  if (key === 'c' || key === 'C' || key === 'l' || key === 'L') player.shielding = !player.shielding;
  if (key === 'p' || key === 'P' || key === 'Escape') togglePause();
}

function doJump() {
  if (!player.alive || state.screen !== 'game') return;
  if (player.jumpsLeft > 0) {
    player.vy = -12.5;
    player.jumpsLeft--;
    spawnParticles(player.x + player.w/2, player.y + player.h, 6, '#aaaaff', 2);
  }
}

function doAttack() {
  if (!player.alive || player.attackCd > 0 || state.screen !== 'game') return;
  player.attacking   = true;
  player.attackTimer = player.attackDur;
  player.attackCd    = 28;
  spawnParticles(
    player.x + (player.facing > 0 ? player.w : 0),
    player.y + player.h * 0.4, 5, '#c0c0c0', 3
  );
}

function doMagic() {
  if (!player.alive || player.magicCd > 0 || player.mp < 15 || state.screen !== 'game') return;
  player.mp -= 15;
  player.magicCd = 45;
  fireballs.push({
    x: player.x + player.w/2,
    y: player.y + player.h*0.4,
    w: 20, h: 14,
    vx: player.facing * 9,
    vy: 0,
    alive: true,
    damage: 25 + player.lvl * 5,
    owner: 'player',
    life: 80,
  });
  spawnParticles(player.x + player.w/2, player.y + player.h*0.4, 8, '#ff6633', 4);
  updateHUD();
}

function togglePause() {
  if (state.screen === 'game') {
    state.screen = 'pause';
    showOverlay('pause');
  } else if (state.screen === 'pause') {
    state.screen = 'game';
    hideOverlays();
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

// ═══════════════════════════════════════════════════════════
//  PARTICLES & FLOAT TEXT
// ═══════════════════════════════════════════════════════════
function spawnParticles(wx, wy, count, color, speed) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = speed * (0.5 + Math.random() * 0.8);
    state.particles.push({
      x: wx, y: wy,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1.5,
      life: 25 + Math.random() * 20,
      maxLife: 45,
      color, r: 2 + Math.random() * 3,
    });
  }
}

function spawnFloatText(wx, wy, text, color) {
  // Convert world coords → screen
  const sx = wx - state.camera.x;
  const sy = wy - state.camera.y;
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left  = sx + 'px';
  el.style.top   = sy + 'px';
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ═══════════════════════════════════════════════════════════
//  DAMAGE SYSTEM
// ═══════════════════════════════════════════════════════════
function damagePlayer(amount) {
  if (player.invincible > 0 || !player.alive) return;
  if (player.shielding) {
    amount = Math.floor(amount * 0.25);
    spawnParticles(player.x + player.w/2, player.y, 8, C.shield, 4);
  }
  if (amount <= 0) return;
  player.hp -= amount;
  player.invincible = 55;
  spawnParticles(player.x + player.w/2, player.y + player.h/2, 10, C.potionH, 3);
  spawnFloatText(player.x + player.w/2, player.y, '-' + amount, '#ff4444');
  updateHUD();
  if (player.hp <= 0) {
    player.hp = 0;
    player.alive = false;
    player.deathAnim = 60;
    setTimeout(triggerGameOver, 1800);
  }
}

function damageEnemy(enemy, amount) {
  if (!enemy.alive) return;
  enemy.hp -= amount;
  spawnParticles(enemy.x + enemy.w/2, enemy.y, 7, '#ff6666', 3);
  spawnFloatText(enemy.x + enemy.w/2, enemy.y, '-' + amount, '#ffcc44');
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;
    enemy.deathAnim = 40;
    // EXP & score
    const expGain  = enemy.type === 'boss' ? 200 : enemy.type === 'skeleton' ? 35 : 20;
    const scoreGain= enemy.type === 'boss' ? 500 : enemy.type === 'skeleton' ? 80 : 50;
    state.score += scoreGain;
    gainExp(expGain);
    updateHUD();
  }
}

function gainExp(amount) {
  player.exp += amount;
  while (player.exp >= player.expNext) {
    player.exp     -= player.expNext;
    player.lvl++;
    player.expNext  = Math.floor(player.expNext * 1.4);
    player.maxHp   += 20;
    player.hp       = Math.min(player.hp + 30, player.maxHp);
    player.maxMp   += 10;
    spawnParticles(player.x + player.w/2, player.y, 20, '#f5c518', 5);
    spawnFloatText(player.x + player.w/2, player.y - 20, 'LEVEL UP! +20HP', '#f5c518');
    updateHUD();
  }
  updateHUD();
}

// ═══════════════════════════════════════════════════════════
//  HUD UPDATER
// ═══════════════════════════════════════════════════════════
function updateHUD() {
  const hpPct = Math.max(0, player.hp / player.maxHp * 100);
  const mpPct = Math.max(0, player.mp / player.maxMp * 100);
  const expPct= Math.min(100, player.exp / player.expNext * 100);

  document.getElementById('hp-bar').style.width  = hpPct + '%';
  document.getElementById('mp-bar').style.width  = mpPct + '%';
  document.getElementById('exp-bar').style.width = expPct + '%';
  document.getElementById('hp-text').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  document.getElementById('mp-text').textContent = `${Math.ceil(player.mp)}/${player.maxMp}`;
  document.getElementById('hud-score').textContent = state.score.toLocaleString();
  document.getElementById('hud-coins').textContent = state.coins;
  document.getElementById('hud-level').textContent = state.level + 1;
}

// ═══════════════════════════════════════════════════════════
//  GAME OVER / LEVEL CLEAR / WIN
// ═══════════════════════════════════════════════════════════
function triggerGameOver() {
  if (state.screen === 'gameover') return;
  state.screen = 'gameover';
  document.getElementById('go-score').textContent = state.score.toLocaleString();
  document.getElementById('go-coins').textContent = state.coins;
  showOverlay('gameover');
}

function triggerLevelClear() {
  if (state.screen === 'levelclear' || state.screen === 'win') return;
  state.score += 300;
  updateHUD();

  const isLast = state.level >= LEVELS.length - 1;
  if (isLast) {
    triggerWin();
    return;
  }
  state.screen = 'levelclear';
  document.getElementById('lc-title').textContent  = `🎉 ${levelData.name} — CLEAR!`;
  document.getElementById('lc-score').textContent  = state.score.toLocaleString();
  document.getElementById('lc-coins').textContent  = state.coins;
  showOverlay('levelclear');
}

function triggerWin() {
  state.screen = 'win';
  document.getElementById('win-score').textContent = state.score.toLocaleString();
  document.getElementById('win-coins').textContent = state.coins;
  showOverlay('win');
}

// ═══════════════════════════════════════════════════════════
//  PLAYER UPDATE
// ═══════════════════════════════════════════════════════════
function updatePlayer() {
  if (!player.alive) {
    if (player.deathAnim > 0) player.deathAnim--;
    return;
  }

  // Cooldowns
  if (player.attackCd   > 0) player.attackCd--;
  if (player.attackTimer> 0) { player.attackTimer--; if(player.attackTimer<=0) player.attacking=false; }
  if (player.magicCd    > 0) player.magicCd--;
  if (player.shieldCd   > 0) player.shieldCd--;
  if (player.invincible > 0) player.invincible--;
  if (player.mp         < player.maxMp) player.mp = Math.min(player.maxMp, player.mp + 0.05);

  // Movement
  const moving = keys['ArrowLeft'] || keys['ArrowRight'];
  if (keys['ArrowLeft'])  { player.vx = -player.speed; player.facing = -1; }
  else if (keys['ArrowRight']) { player.vx =  player.speed; player.facing =  1; }
  else { player.vx *= 0.72; }

  // Keep in level bounds
  if (player.x < 0) { player.x = 0; player.vx = 0; }
  const maxX = levelData.width * TILE - player.w;
  if (player.x > maxX) { player.x = maxX; player.vx = 0; }

  resolveEntity(player);

  if (player.onGround) player.jumpsLeft = 2;

  // Fall off screen
  if (player.y > levelData.height * TILE + 60) damagePlayer(30);

  // Walk animation
  if (moving) { player.walkCycle += 0.18; }
  player.animTimer++;

  // Skill bar cooldown visual
  const magicSlot = document.getElementById('cd-magic');
  const shieldSlot= document.getElementById('cd-shield');
  if (magicSlot)  magicSlot.style.transform  = `scaleY(${player.magicCd  / 45})`;
  if (shieldSlot) shieldSlot.style.transform = `scaleY(${player.shieldCd / 60})`;
}

// ═══════════════════════════════════════════════════════════
//  ENEMY AI UPDATE
// ═══════════════════════════════════════════════════════════
function updateEnemies() {
  currentEnemies.forEach(en => {
    if (!en.alive) {
      if (en.deathAnim > 0) en.deathAnim--;
      return;
    }

    en.animTimer++;
    if (en.stunTimer > 0) { en.stunTimer--; return; }
    if (en.attackCd  > 0) en.attackCd--;

    const dx = player.x - en.x;
    const dy = player.y - en.y;
    const dist = Math.hypot(dx, dy);

    // Aggro
    if (dist < en.aggroRange) en.aggro = true;
    if (dist > en.aggroRange * 1.6) en.aggro = false;

    // Boss phase 2 at 50% HP
    if (en.type === 'boss' && en.hp < en.maxHp * 0.5 && en.phase === 1) {
      en.phase = 2;
      en.speed = 2.8;
      en.projectileCd = 55;
      spawnFloatText(en.x + en.w/2, en.y - 20, 'PHASE 2!', '#ff0000');
      spawnParticles(en.x+en.w/2, en.y+en.h/2, 25, '#8b0000', 5);
    }

    if (en.aggro && player.alive) {
      // Chase
      if (Math.abs(dx) > 10) {
        en.vx = Math.sign(dx) * en.speed;
        en.facing = Math.sign(dx);
      } else {
        en.vx = 0;
      }
      // Melee attack
      if (aabb({ x:en.x-10, y:en.y, w:en.w+20, h:en.h }, player) && en.attackCd <= 0) {
        const dmg = en.type === 'boss' ? (en.phase===2 ? 28 : 18) :
                    en.type === 'skeleton' ? 14 : 10;
        damagePlayer(dmg);
        en.attackCd = en.type === 'boss' ? 60 : 80;
      }
      // Ranged (skeleton / boss)
      if (en.projectileCd > 0) en.projectileCd--;
      if (en.projectileCd <= 0 && dist < en.aggroRange) {
        const spd = en.type === 'boss' ? 6 : 4;
        const angle = Math.atan2(dy, dx);
        const spread = en.type === 'boss' && en.phase === 2 ? 3 : 1;
        for (let s = 0; s < spread; s++) {
          const a = angle + (s - (spread-1)/2) * 0.25;
          enemyProjectiles.push({
            x: en.x + en.w/2, y: en.y + en.h*0.4,
            w: 14, h: 10,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            alive: true, life: 70,
            damage: en.type === 'boss' ? 20 : 10,
          });
        }
        en.projectileCd = en.type === 'boss' ? (en.phase===2?55:90) : 150;
      }
    } else {
      // Patrol
      en.vx = en.facing * en.speed * 0.6;
      if (Math.abs(en.x - en.patrolOriginX) > en.patrolRange) en.facing *= -1;
    }

    resolveEntity(en);

    // Clamp in level
    if (en.x < 0) { en.x = 0; en.facing = 1; }
    const maxEX = levelData.width * TILE - en.w;
    if (en.x > maxEX) { en.x = maxEX; en.facing = -1; }

    // Attack hitbox
    if (player.attacking && player.alive) {
      const hitX = player.facing > 0 ? player.x + player.w : player.x - 44;
      const hit  = { x: hitX, y: player.y + 4, w: 44, h: player.h - 8 };
      if (aabb(hit, en)) {
        const dmg = 15 + player.lvl * 4;
        damageEnemy(en, dmg);
        en.stunTimer = 10;
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  PROJECTILES
// ═══════════════════════════════════════════════════════════
function updateProjectiles() {
  // Player fireballs
  fireballs = fireballs.filter(fb => {
    if (!fb.alive) return false;
    fb.x += fb.vx;
    fb.y += fb.vy;
    fb.life--;
    if (fb.life <= 0) return false;
    // Tile collision
    const tx = Math.floor(fb.x / TILE), ty = Math.floor(fb.y / TILE);
    if (isSolid(getTile(tx,ty))) {
      spawnParticles(fb.x, fb.y, 8, C.fireball, 4);
      return false;
    }
    // Enemy collision
    for (const en of currentEnemies) {
      if (!en.alive) continue;
      if (aabb(fb, en)) {
        damageEnemy(en, fb.damage);
        spawnParticles(fb.x, fb.y, 10, C.fireball, 4);
        return false;
      }
    }
    return true;
  });

  // Enemy projectiles
  enemyProjectiles = enemyProjectiles.filter(proj => {
    if (!proj.alive) return false;
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.life--;
    if (proj.life <= 0) return false;
    const tx = Math.floor(proj.x / TILE), ty = Math.floor(proj.y / TILE);
    if (isSolid(getTile(tx,ty))) return false;
    if (player.alive && aabb(proj, player)) {
      damagePlayer(proj.damage);
      spawnParticles(proj.x, proj.y, 6, '#884444', 3);
      return false;
    }
    return true;
  });
}

// ═══════════════════════════════════════════════════════════
//  COLLECTIBLES
// ═══════════════════════════════════════════════════════════
function updateCollectibles() {
  // Coins
  currentCoins.forEach(coin => {
    if (coin.collected) return;
    const cr = { x: coin.tileX*TILE + 8, y: coin.tileY*TILE - TILE + 10, w:22, h:22 };
    if (aabb(cr, player)) {
      coin.collected = true;
      state.coins++;
      state.score += 10;
      spawnParticles(cr.x+11, cr.y+11, 8, C.coin, 4);
      spawnFloatText(cr.x, cr.y, '+10', '#f5c518');
      gainExp(5);
      updateHUD();
    }
  });

  // Potions
  currentPotions.forEach(pot => {
    if (pot.collected) return;
    const pr = { x: pot.tileX*TILE + 8, y: pot.tileY*TILE - TILE + 6, w:22, h:30 };
    if (aabb(pr, player)) {
      pot.collected = true;
      if (pot.type === 'hp') {
        const heal = 30;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        spawnParticles(pr.x+11, pr.y+15, 10, C.potionH, 3);
        spawnFloatText(pr.x, pr.y, '+' + heal + ' HP', '#ff6b6b');
      } else {
        const mana = 25;
        player.mp = Math.min(player.maxMp, player.mp + mana);
        spawnParticles(pr.x+11, pr.y+15, 10, C.potionM, 3);
        spawnFloatText(pr.x, pr.y, '+' + mana + ' MP', '#5dade2');
      }
      updateHUD();
    }
  });

  // Portal
  if (levelData.portal && player.alive) {
    const portal = levelData.portal;
    // Check if all enemies dead
    const allDead = currentEnemies.every(e => !e.alive);
    if (allDead) {
      const pr = { x: portal.tileX*TILE, y: (portal.tileY-1)*TILE, w:TILE, h:TILE*2 };
      if (aabb(pr, player)) triggerLevelClear();
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  PARTICLES UPDATE
// ═══════════════════════════════════════════════════════════
function updateParticles() {
  state.particles = state.particles.filter(p => {
    p.x += p.vx; p.y += p.vy;
    p.vy += GRAVITY * 0.3;
    p.life--;
    return p.life > 0;
  });
}

// ═══════════════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════════════
function updateCamera() {
  const targetX = player.x - canvas.width  * 0.4;
  const targetY = player.y - canvas.height * 0.55;
  const maxCamX = levelData.width  * TILE - canvas.width;
  const maxCamY = levelData.height * TILE - canvas.height;
  state.camera.x += (Math.max(0, Math.min(maxCamX, targetX)) - state.camera.x) * 0.1;
  state.camera.y += (Math.max(0, Math.min(maxCamY, targetY)) - state.camera.y) * 0.1;
}

// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════
function render() {
  const W = canvas.width, H = canvas.height;
  const cx = Math.floor(state.camera.x), cy = Math.floor(state.camera.y);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, levelData.bgColor[0]);
  sky.addColorStop(1, levelData.bgColor[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars
  state.stars.forEach(s => {
    const sx = s.x - cx;
    const sy = s.y - cy * 0.3; // parallax
    if (sx < -4 || sx > W+4 || sy < -4 || sy > H+4) return;
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Background mountains (parallax)
  drawMountains(cx, cy, H);

  // Tiles
  const tileX1 = Math.max(0, Math.floor(cx / TILE) - 1);
  const tileX2 = Math.min(levelData.width-1,  Math.floor((cx+W) / TILE) + 1);
  const tileY1 = Math.max(0, Math.floor(cy / TILE) - 1);
  const tileY2 = Math.min(levelData.height-1, Math.floor((cy+H) / TILE) + 1);

  for (let ty = tileY1; ty <= tileY2; ty++) {
    for (let tx = tileX1; tx <= tileX2; tx++) {
      const t = getTile(tx, ty);
      if (t === 0) continue;
      drawTile(t, tx, ty, cx, cy);
    }
  }

  // Collectibles
  drawCoins(cx, cy);
  drawPotions(cx, cy);
  drawPortal(cx, cy);

  // Enemy projectiles
  enemyProjectiles.forEach(proj => {
    if (!proj.alive) return;
    const sx = proj.x - cx, sy = proj.y - cy;
    ctx.fillStyle = '#aa2222';
    ctx.beginPath();
    ctx.arc(sx + proj.w/2, sy + proj.h/2, proj.w/2, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(sx + proj.w/2 - 2, sy + proj.h/2 - 2, proj.w/4, 0, Math.PI*2);
    ctx.fill();
  });

  // Player fireballs
  fireballs.forEach(fb => {
    if (!fb.alive) return;
    const sx = fb.x - cx, sy = fb.y - cy;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
    grad.addColorStop(0, '#ffffaa');
    grad.addColorStop(0.4,'#ff9933');
    grad.addColorStop(1,  'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 14, 9, Math.atan2(fb.vy, fb.vx), 0, Math.PI*2);
    ctx.fill();
  });

  // Enemies
  currentEnemies.forEach(en => drawEnemy(en, cx, cy));

  // Player
  drawPlayer(cx, cy);

  // Particles
  state.particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - cx, p.y - cy, p.r, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // "Kill all enemies" reminder
  const allDead = currentEnemies.every(e => !e.alive);
  if (!allDead) {
    const alive = currentEnemies.filter(e => e.alive).length;
    ctx.fillStyle = 'rgba(255,100,100,0.8)';
    ctx.font      = 'bold 15px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'right';
    ctx.fillText(`Musuh tersisa: ${alive} — Kalahkan semua untuk membuka portal!`, W - 12, 30);
  } else {
    ctx.fillStyle = 'rgba(100,255,100,0.9)';
    ctx.font      = 'bold 15px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.fillText('✅ Semua musuh kalah! Masuk portal!', W/2, 30);
  }
  ctx.textAlign = 'left';
}

// ─── DRAW TILES ───
function drawTile(t, tx, ty, cx, cy) {
  const sx = tx * TILE - cx, sy = ty * TILE - cy;
  if (t === 1) {         // tanah
    ctx.fillStyle = C.ground1;
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = C.grass;
    ctx.fillRect(sx, sy, TILE, 7);
    // texture lines
    ctx.fillStyle = C.ground2;
    ctx.fillRect(sx + 5, sy + 10, TILE-10, 2);
    ctx.fillRect(sx + 8, sy + 18, TILE-16, 2);
  } else if (t === 2) {  // platform
    ctx.fillStyle = C.platform;
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.fillStyle = '#7a5225';
    ctx.fillRect(sx, sy, TILE, 8);
    ctx.fillStyle = '#3d2010';
    ctx.fillRect(sx, sy + TILE - 4, TILE, 4);
  } else if (t === 3) {  // stone
    ctx.fillStyle = C.stone;
    ctx.fillRect(sx, sy, TILE, TILE);
    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx+2, sy+2, TILE-4, TILE-4);
    ctx.fillStyle = '#666688';
    ctx.fillRect(sx+4, sy+4, 10, 8);
  }
  // Tile border highlight
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(sx, sy, TILE, TILE);
}

// ─── MOUNTAINS PARALLAX ───
function drawMountains(cx, cy) {
  const H = canvas.height;
  const W = canvas.width;
  ctx.fillStyle = levelData.level === 2 ? '#1a1030' : '#141450';

  // Far mountains (slower parallax)
  const off1 = (cx * 0.15) % (W * 2);
  for (let i = -1; i < 4; i++) {
    const baseX = i * W - off1;
    ctx.beginPath();
    ctx.moveTo(baseX, H * 0.7);
    ctx.lineTo(baseX + W*0.1, H * 0.4);
    ctx.lineTo(baseX + W*0.25, H * 0.55);
    ctx.lineTo(baseX + W*0.4, H * 0.3);
    ctx.lineTo(baseX + W*0.55, H * 0.5);
    ctx.lineTo(baseX + W*0.7, H * 0.35);
    ctx.lineTo(baseX + W*0.85, H * 0.52);
    ctx.lineTo(baseX + W, H * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  // Near mountains
  ctx.fillStyle = levelData.level === 2 ? '#241840' : '#1e1e70';
  const off2 = (cx * 0.3) % (W * 2);
  for (let i = -1; i < 4; i++) {
    const baseX = i * W - off2;
    ctx.beginPath();
    ctx.moveTo(baseX, H * 0.75);
    ctx.lineTo(baseX + W*0.15, H * 0.52);
    ctx.lineTo(baseX + W*0.3,  H * 0.65);
    ctx.lineTo(baseX + W*0.45, H * 0.46);
    ctx.lineTo(baseX + W*0.6,  H * 0.6);
    ctx.lineTo(baseX + W*0.78, H * 0.49);
    ctx.lineTo(baseX + W, H * 0.75);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── DRAW PLAYER ───
function drawPlayer(cx, cy) {
  const sx = Math.floor(player.x - cx);
  const sy = Math.floor(player.y - cy);
  const W  = player.w, H = player.h;

  if (!player.alive) {
    // Death animation
    const alpha = player.deathAnim / 60;
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(sx + W/2, sy + H/2);
    ctx.rotate((60 - player.deathAnim) * 0.05);
  }

  // Invincibility blink
  if (player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  const f = player.facing;
  ctx.save();
  if (f < 0) { ctx.translate(sx + W/2, 0); ctx.scale(-1,1); ctx.translate(-(sx+W/2), 0); }

  // Body
  const bodyGrad = ctx.createLinearGradient(sx, sy, sx+W, sy+H);
  bodyGrad.addColorStop(0, '#7b4f9e');
  bodyGrad.addColorStop(1, '#4a2a70');
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(sx + 4, sy + 14, W - 8, H - 14);

  // Armor highlight
  ctx.fillStyle = '#9966cc';
  ctx.fillRect(sx + 4, sy + 14, W - 8, 10);

  // Cape
  ctx.fillStyle = '#8b0000';
  ctx.beginPath();
  ctx.moveTo(sx, sy + 18);
  ctx.lineTo(sx - 8, sy + H * 0.8);
  ctx.lineTo(sx + 4, sy + H * 0.6);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = C.player;
  ctx.fillRect(sx + 5, sy, W - 10, 16);

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx + W - 12, sy + 4, 5, 5);
  ctx.fillStyle = '#222';
  ctx.fillRect(sx + W - 11, sy + 5, 3, 3);

  // Helmet
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(sx + 3, sy - 2, W - 6, 8);
  ctx.fillStyle = '#a0a0a0';
  ctx.fillRect(sx + 3, sy - 2, W - 6, 3);

  // Legs (walking)
  const legOff = Math.sin(player.walkCycle) * 5;
  ctx.fillStyle = '#3a1a5a';
  ctx.fillRect(sx + 4,  sy + H - 14 + legOff,  W/2 - 3, 14);
  ctx.fillRect(sx + W/2, sy + H - 14 - legOff, W/2 - 4, 14);

  // Boots
  ctx.fillStyle = '#2a1010';
  ctx.fillRect(sx + 3,  sy + H - 4 + legOff,  W/2 - 1, 5);
  ctx.fillRect(sx + W/2, sy + H - 4 - legOff, W/2 - 2, 5);

  // Sword (always visible in hand)
  if (!player.shielding) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    // blade
    const swAnim = player.attacking ? Math.sin(player.attackTimer * 0.35) * 0.8 : 0;
    ctx.save();
    ctx.translate(sx + W, sy + H * 0.45);
    ctx.rotate(swAnim);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(28, -6);
    ctx.stroke();
    // guard
    ctx.strokeStyle = '#f5c518';
    ctx.lineWidth   = 5;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(2, 6);
    ctx.stroke();
    ctx.restore();
  }

  // Shield
  if (player.shielding) {
    ctx.fillStyle = 'rgba(93,173,226,0.5)';
    ctx.strokeStyle= '#5dade2';
    ctx.lineWidth  = 2;
    ctx.beginPath();
    ctx.ellipse(sx + W + 10, sy + H*0.4, 20, 26, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    // emblem
    ctx.fillStyle = '#3498db';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛡', sx + W + 10, sy + H*0.4 + 5);
    ctx.textAlign = 'left';
  }

  // Attack effect
  if (player.attacking) {
    const slashAlpha = player.attackTimer / player.attackDur;
    ctx.globalAlpha = slashAlpha * 0.8;
    const grad = ctx.createLinearGradient(sx + W, sy, sx + W + 50, sy + H);
    grad.addColorStop(0, '#ffffffcc');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sx + W,     sy + H*0.3);
    ctx.lineTo(sx + W + 50, sy + H*0.1);
    ctx.lineTo(sx + W + 50, sy + H*0.65);
    ctx.lineTo(sx + W,     sy + H*0.65);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (!player.alive) {
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  if (player.invincible > 0) ctx.globalAlpha = 1;
}

// ─── DRAW ENEMY ───
function drawEnemy(en, cx, cy) {
  if (!en.alive && en.deathAnim <= 0) return;
  const sx = Math.floor(en.x - cx), sy = Math.floor(en.y - cy);
  const W = en.w, H = en.h;

  // Death fade
  if (!en.alive) {
    ctx.globalAlpha = en.deathAnim / 40;
    spawnParticles(en.x+W/2, en.y+H/2, 1, en.type==='boss'?'#8b0000':'#aaa', 2);
  }

  ctx.save();
  if (en.facing < 0) {
    ctx.translate(sx + W/2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(sx+W/2), 0);
  }

  const bob = Math.sin(en.animTimer * 0.1) * 2;

  if (en.type === 'goblin') {
    // Body
    ctx.fillStyle = '#3a7a2a';
    ctx.fillRect(sx+4, sy+14+bob, W-8, H-20);
    // Head
    ctx.fillStyle = '#5a9e45';
    ctx.fillRect(sx+2, sy+bob, W-4, 16);
    // Ears
    ctx.fillStyle = '#5a9e45';
    ctx.fillRect(sx-3, sy+2+bob, 5, 8);
    ctx.fillRect(sx+W-2, sy+2+bob, 5, 8);
    // Eyes
    ctx.fillStyle = '#ff0'; ctx.fillRect(sx+5,  sy+5+bob, 5, 4);
    ctx.fillStyle = '#ff0'; ctx.fillRect(sx+W-10, sy+5+bob, 5, 4);
    ctx.fillStyle = '#000'; ctx.fillRect(sx+7,  sy+6+bob, 2, 2);
    ctx.fillStyle = '#000'; ctx.fillRect(sx+W-9, sy+6+bob, 2, 2);
    // Club
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(sx+W-2, sy+8+bob, 5, H*0.5);
    ctx.fillStyle = '#6b4914';
    ctx.fillRect(sx+W-4, sy+8+bob, 9, 10);
    // Legs
    ctx.fillStyle = '#2a5a1a';
    ctx.fillRect(sx+4,  sy+H-10+bob, 8, 10);
    ctx.fillRect(sx+W-12, sy+H-10+bob, 8, 10);

  } else if (en.type === 'skeleton') {
    // Bone body
    ctx.fillStyle = '#cdc8b0';
    ctx.fillRect(sx+6, sy+14+bob, W-12, H-20);
    // Ribs
    ctx.strokeStyle = '#a0a090'; ctx.lineWidth = 1.5;
    for (let i=0; i<3; i++) {
      ctx.beginPath();
      ctx.moveTo(sx+6, sy+18+i*7+bob);
      ctx.lineTo(sx+W-6, sy+18+i*7+bob);
      ctx.stroke();
    }
    // Head (skull)
    ctx.fillStyle = '#e0d9c5';
    ctx.fillRect(sx+3, sy+bob, W-6, 16);
    // Eye sockets
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(sx+8, sy+7+bob, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx+W-8, sy+7+bob, 4, 0, Math.PI*2); ctx.fill();
    // Jaw
    ctx.fillStyle = '#cdc8b0';
    ctx.fillRect(sx+5, sy+13+bob, W-10, 5);
    ctx.fillStyle = '#1a1a1a';
    for(let i=0;i<4;i++) ctx.fillRect(sx+6+i*4, sy+14+bob, 2, 4);
    // Sword arm
    ctx.strokeStyle = '#cdc8b0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx+W-3, sy+18+bob); ctx.lineTo(sx+W-3, sy+H-8+bob); ctx.stroke();
    ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx+W-3, sy+H-8+bob); ctx.lineTo(sx+W+14, sy+H-20+bob); ctx.stroke();
    // Legs
    ctx.strokeStyle = '#cdc8b0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx+9, sy+H-6+bob); ctx.lineTo(sx+9, sy+H+bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx+W-9, sy+H-6+bob); ctx.lineTo(sx+W-9, sy+H+bob); ctx.stroke();

  } else if (en.type === 'boss') {
    const ph2 = en.phase === 2;
    // Cloak
    ctx.fillStyle = ph2 ? '#4a0000' : '#2a0000';
    ctx.beginPath();
    ctx.moveTo(sx, sy+18+bob);
    ctx.lineTo(sx-10, sy+H+bob);
    ctx.lineTo(sx+W+10, sy+H+bob);
    ctx.lineTo(sx+W, sy+18+bob);
    ctx.closePath(); ctx.fill();
    // Body armor
    const bodyGrad = ctx.createLinearGradient(sx, sy, sx+W, sy+H);
    bodyGrad.addColorStop(0, ph2 ? '#ff2200' : '#8b0000');
    bodyGrad.addColorStop(1, ph2 ? '#660000' : '#3d0000');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(sx+6, sy+14+bob, W-12, H-20);
    // Spikes on shoulders
    for(let i=0;i<3;i++) {
      ctx.fillStyle = '#c0c0c0';
      ctx.beginPath();
      ctx.moveTo(sx+2+i*8, sy+16+bob);
      ctx.lineTo(sx+5+i*8, sy+6+bob);
      ctx.lineTo(sx+8+i*8, sy+16+bob);
      ctx.closePath(); ctx.fill();
    }
    // Head
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(sx+4, sy+bob, W-8, 18);
    // Horns
    ctx.fillStyle = '#440000';
    ctx.beginPath(); ctx.moveTo(sx+8, sy+bob); ctx.lineTo(sx+4, sy-12+bob); ctx.lineTo(sx+14, sy+2+bob); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx+W-8, sy+bob); ctx.lineTo(sx+W-4, sy-12+bob); ctx.lineTo(sx+W-14, sy+2+bob); ctx.fill();
    // Eyes (glowing)
    ctx.fillStyle = ph2 ? '#ff4400' : '#ff0000';
    ctx.shadowBlur = 10; ctx.shadowColor = ph2 ? '#ff4400' : '#ff0000';
    ctx.beginPath(); ctx.arc(sx+12, sy+8+bob, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx+W-12, sy+8+bob, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Weapon (great sword)
    ctx.strokeStyle = ph2 ? '#ff6600' : '#888888';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(sx+W+2, sy+10+bob); ctx.lineTo(sx+W+2, sy+H+5+bob); ctx.stroke();
    ctx.strokeStyle = '#f5c518'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(sx+W-5, sy+20+bob); ctx.lineTo(sx+W+9, sy+20+bob); ctx.stroke();
    // HP bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx, sy-16+bob, W, 8);
    ctx.fillStyle = ph2 ? '#ff4400' : '#cc0000';
    ctx.fillRect(sx, sy-16+bob, W * (en.hp/en.maxHp), 8);
    ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy-16+bob, W, 8);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('BOSS', sx+W/2, sy-10+bob); ctx.textAlign = 'left';
  }

  // Enemy HP bar (non-boss, when low)
  if (en.type !== 'boss' && en.hp < en.maxHp) {
    const bw = W;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(sx, sy-10, bw, 5);
    ctx.fillStyle = en.hp > en.maxHp*0.5 ? '#2ecc71' : en.hp > en.maxHp*0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(sx, sy-10, bw * (en.hp/en.maxHp), 5);
  }

  ctx.restore();
  if (!en.alive) ctx.globalAlpha = 1;
}

// ─── DRAW COINS ───
function drawCoins(cx, cy) {
  const t = Date.now() * 0.003;
  currentCoins.forEach((coin, i) => {
    if (coin.collected) return;
    const sx = coin.tileX*TILE - cx + TILE/2;
    const sy = coin.tileY*TILE - TILE - cy + 15 + Math.sin(t + i) * 4;

    // Glow
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 16);
    glow.addColorStop(0, 'rgba(245,197,24,0.4)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(sx-16, sy-16, 32, 32);

    // Coin
    ctx.fillStyle = '#f5c518';
    ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.arc(sx-2, sy-2, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c8980a';
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('₵', sx, sy+4); ctx.textAlign = 'left';
  });
}

// ─── DRAW POTIONS ───
function drawPotions(cx, cy) {
  const t = Date.now() * 0.002;
  currentPotions.forEach((pot, i) => {
    if (pot.collected) return;
    const sx = pot.tileX*TILE - cx + TILE/2;
    const sy = pot.tileY*TILE - TILE - cy + 10 + Math.sin(t + i*1.3) * 4;
    const col = pot.type === 'hp' ? '#e74c3c' : '#3498db';
    const col2= pot.type === 'hp' ? '#ff8888' : '#88ccff';

    // Bottle
    ctx.fillStyle = col;
    ctx.fillRect(sx-6, sy+4, 12, 16);
    ctx.fillStyle = col2;
    ctx.fillRect(sx-4, sy+6, 5, 8);
    // Neck
    ctx.fillStyle = '#777';
    ctx.fillRect(sx-3, sy-2, 6, 7);
    // Cork
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(sx-2, sy-5, 4, 4);
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(pot.type==='hp'?'HP':'MP', sx, sy+15); ctx.textAlign = 'left';
  });
}

// ─── DRAW PORTAL ───
function drawPortal(cx, cy) {
  if (!levelData.portal) return;
  const allDead = currentEnemies.every(e => !e.alive);
  const portal  = levelData.portal;
  const sx = portal.tileX * TILE - cx;
  const sy = (portal.tileY - 1) * TILE - cy;
  const t  = Date.now() * 0.003;

  if (!allDead) {
    // Locked portal (gray)
    ctx.fillStyle = 'rgba(100,100,100,0.3)';
    ctx.fillRect(sx, sy, TILE, TILE*2);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, TILE, TILE*2);
    ctx.fillStyle = '#888';
    ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🔒', sx+TILE/2, sy+TILE+10); ctx.textAlign = 'left';
    return;
  }

  // Animated portal
  const pGrad = ctx.createRadialGradient(sx+TILE/2, sy+TILE, 0, sx+TILE/2, sy+TILE, TILE);
  pGrad.addColorStop(0, `hsla(${t*50%360},100%,70%,0.9)`);
  pGrad.addColorStop(0.5,'rgba(100,0,200,0.6)');
  pGrad.addColorStop(1,  'transparent');
  ctx.fillStyle = pGrad;
  ctx.fillRect(sx, sy, TILE, TILE*2);

  // Spinning rings
  for (let r=0; r<3; r++) {
    ctx.save();
    ctx.translate(sx+TILE/2, sy+TILE);
    ctx.rotate(t + r * 2.1);
    ctx.strokeStyle = `hsla(${(r*120+t*30)%360},100%,70%,0.8)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, TILE*0.45, TILE*0.6, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif'; ctx.textAlign='center';
  ctx.fillText('🌀', sx+TILE/2, sy+TILE+8); ctx.textAlign='left';
}

// ═══════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════
function gameLoop(timestamp) {
  if (state.screen !== 'game') return;

  state.dt = Math.min((timestamp - state.lastTime) / (1000/FPS_TARGET), 3);
  state.lastTime = timestamp;

  updatePlayer();
  updateEnemies();
  updateProjectiles();
  updateCollectibles();
  updateParticles();
  updateCamera();
  render();

  state.frameId = requestAnimationFrame(gameLoop);
}

function startGame(fromLevel = 0) {
  state.level  = fromLevel;
  state.screen = 'game';

  if (fromLevel === 0) {
    // Reset total stats only on new game
    state.score  = 0;
    state.coins  = 0;
    player.hp    = player.maxHp;
    player.mp    = player.maxMp;
    player.exp   = 0;
    player.expNext=100;
    player.lvl   = 1;
    player.maxHp = 100;
    player.maxMp = 60;
  }

  hideOverlays();
  showScreen('game');
  resizeCanvas();
  loadLevel(state.level);
  updateHUD();

  state.lastTime = performance.now();
  if (state.frameId) cancelAnimationFrame(state.frameId);
  state.frameId  = requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════════════════════
//  UI EVENT WIRING
// ═══════════════════════════════════════════════════════════
function wireUI() {
  // Menu
  document.getElementById('btn-play').addEventListener('click', () => startGame(0));
  document.getElementById('btn-howto').addEventListener('click', () => {
    showScreen('howto');
  });
  document.getElementById('btn-credits').addEventListener('click', () => {
    showScreen('credits');
  });

  document.getElementById('btn-back-howto').addEventListener('click', () => {
    showScreen('menu');
  });
  document.getElementById('btn-back-credits').addEventListener('click', () => {
    showScreen('menu');
  });

  // Pause overlay
  document.getElementById('btn-resume').addEventListener('click', () => {
    state.screen = 'game';
    hideOverlays();
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  });
  document.getElementById('btn-menu-from-pause').addEventListener('click', () => {
    state.screen = 'menu';
    hideOverlays();
    showScreen('menu');
  });

  // Game Over overlay
  document.getElementById('btn-retry').addEventListener('click', () => {
    // Retry: keep total score/coins but respawn
    hideOverlays();
    startGame(state.level);
  });
  document.getElementById('btn-menu-from-go').addEventListener('click', () => {
    state.screen = 'menu';
    hideOverlays();
    showScreen('menu');
  });

  // Level Clear overlay
  document.getElementById('btn-next-level').addEventListener('click', () => {
    hideOverlays();
    startGame(state.level + 1);
  });
  document.getElementById('btn-menu-from-lc').addEventListener('click', () => {
    state.screen = 'menu';
    hideOverlays();
    showScreen('menu');
  });

  // Win overlay
  document.getElementById('btn-play-again').addEventListener('click', () => {
    hideOverlays();
    startGame(0);
  });
  document.getElementById('btn-menu-from-win').addEventListener('click', () => {
    state.screen = 'menu';
    hideOverlays();
    showScreen('menu');
  });
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (state.screen === 'game' && levelData) {
      state.stars = Array.from({length:80}, () => ({
        x: Math.random() * levelData.width * TILE,
        y: Math.random() * canvas.height * 0.6,
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.6 + 0.3,
      }));
    }
  });

  setupInput();
  wireUI();
  spawnMenuParticles();
  showScreen('menu');
}

// Kick off
document.addEventListener('DOMContentLoaded', init);
