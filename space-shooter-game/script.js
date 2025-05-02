// Space Shooter Game JavaScript

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let gameOver = false;
let score = 0;

// Player spaceship
const player = {
  width: 50,
  height: 40,
  x: canvasWidth / 2 - 25,
  y: canvasHeight - 60,
  speed: 7,
  dx: 0,
  color: '#0ff',
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  },
  update() {
    this.x += this.dx;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
  }
};

// Projectiles fired by player
const projectiles = [];
const projectileSpeed = 10;
const projectileWidth = 4;
const projectileHeight = 10;

function drawProjectile(p) {
  ctx.fillStyle = '#0ff';
  ctx.fillRect(p.x, p.y, projectileWidth, projectileHeight);
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].y -= projectileSpeed;
    if (projectiles[i].y + projectileHeight < 0) {
      projectiles.splice(i, 1);
    }
  }
}

// Enemies
const enemies = [];
const enemyWidth = 40;
const enemyHeight = 30;
const enemySpeed = 2;
const enemySpawnInterval = 1500; // ms

function createEnemy() {
  const x = Math.random() * (canvasWidth - enemyWidth);
  enemies.push({ x, y: -enemyHeight, width: enemyWidth, height: enemyHeight, color: '#f00' });
}

function drawEnemy(enemy) {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemySpeed;
    if (enemies[i].y > canvasHeight) {
      enemies.splice(i, 1);
      // Optional: Penalize player or end game if enemy passes
      gameOver = true;
    }
  }
}

// Collision detection
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function checkCollisions() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];
      if (isColliding(enemy, { x: projectile.x, y: projectile.y, width: projectileWidth, height: projectileHeight })) {
        enemies.splice(i, 1);
        projectiles.splice(j, 1);
        score += 10;
        updateScore();
        break;
      }
    }
    if (isColliding(enemy, player)) {
      gameOver = true;
    }
  }
}

// Score update
function updateScore() {
  document.getElementById('score').textContent = 'Score: ' + score;
}

// Clear canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Game over display
function displayGameOver() {
  document.getElementById('gameOver').classList.remove('hidden');
}

// Restart game
function restartGame() {
  gameOver = false;
  score = 0;
  enemies.length = 0;
  projectiles.length = 0;
  player.x = canvasWidth / 2 - player.width / 2;
  document.getElementById('gameOver').classList.add('hidden');
  updateScore();
  loop();
}

// Game loop
function loop() {
  if (gameOver) {
    displayGameOver();
    return;
  }
  clearCanvas();
  player.update();
  player.draw();
  updateProjectiles();
  projectiles.forEach(drawProjectile);
  updateEnemies();
  enemies.forEach(drawEnemy);
  checkCollisions();
  requestAnimationFrame(loop);
}

// Controls
function keyDownHandler(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    player.dx = -player.speed;
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    player.dx = player.speed;
  } else if (e.code === 'Space') {
    if (!gameOver) {
      shoot();
    }
  } else if (e.code === 'KeyR' && gameOver) {
    restartGame();
  }
}

function keyUpHandler(e) {
  if (
    (e.code === 'ArrowLeft' || e.code === 'KeyA') && player.dx < 0 ||
    (e.code === 'ArrowRight' || e.code === 'KeyD') && player.dx > 0
  ) {
    player.dx = 0;
  }
}

function shoot() {
  const projectileX = player.x + player.width / 2 - projectileWidth / 2;
  const projectileY = player.y;
  projectiles.push({ x: projectileX, y: projectileY });
}

// Enemy spawn timer
let enemySpawnTimer = setInterval(() => {
  if (!gameOver) {
    createEnemy();
  }
}, enemySpawnInterval);

// Event listeners
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Start game
updateScore();
loop();
