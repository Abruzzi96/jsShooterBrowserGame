const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');    

// Event listener for starting the game
startButton.addEventListener('click', startGame);

function startGame() {
    paused = false;  // Unpause the game
    startMenu.style.display = 'none';  // Hide the start button after the game begins
    requestAnimationFrame(gameLoop);   // Start the game loop
}

// Initially, the game is paused
paused = true;

const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const timerDisplay = document.getElementById('timer');
const pauseMenu = document.getElementById('pause-menu');

const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const pauseRestartButton = document.getElementById('pause-restart-button');

const fpsDisplay = document.getElementById('fps');
let lastFrameTime = performance.now();
let frameCount = 0;

// Event listeners for keyboard input
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Restart the game
restartButton.addEventListener('click', restartGame);
pauseRestartButton.addEventListener('click', restartGame);

let score = 0;
let lives = 3;
let gameTime = 0;
let speed = 7;
let bulletSpeed = 10;
let enemySpeed = 1;
let playerPos = { y: window.innerHeight - 100, x: window.innerWidth / 2 - 25 }; 
let keys = {};
let bullets = [];
let enemies = [];
let enemySpawnInterval = 2000;
let canShoot = true; 

// FPS OPT STARTED //

const desiredFPS = 60;
const frameDuration = 1000 / desiredFPS; // Time per frame (in ms)

function gameLoop() {
    const currentTime = performance.now();
    const elapsed = currentTime - lastFrameTime;

    // Only run the game logic if the elapsed time exceeds the duration of a frame
    if (elapsed > frameDuration) {
        lastFrameTime = currentTime - (elapsed % frameDuration); // Correct for any overflow
        
        // Run game logic here
        if (!paused) {
            movePlayer();
            moveBullets();
            moveEnemies();
            checkCollisions();
            updateUI();
        }

        // Update FPS display (optional)
        let fps = Math.round(1000 / elapsed);
        fpsDisplay.textContent = fps; // Assuming you have an element with id="fps"
    }

    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);


// FPS OPT ENDED //

// Pause toggle
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' || e.code === 'Escape') {
        paused = !paused;
        pauseMenu.style.display = paused ? 'block' : 'none';
    }
});

// Game loop using requestAnimationFrame
function gameLoop() {
    if (!paused) {
        movePlayer();
        moveBullets();
        moveEnemies();
        checkCollisions();
        updateUI();
        if (keys['Space'] && canShoot) {
            shootBullet();
            canShoot = false; // Prevent continuous shooting without delay
            setTimeout(() => {
                canShoot = true; // Add a small delay between shots
            }, 300); // Adjust delay as needed
        }
    }

    // Calculate FPS
    let now = performance.now();
    frameCount++;
    if (now - lastFrameTime >= 1000) { // Update FPS every second
        let fps = frameCount;
        fpsDisplay.textContent = fps;
        frameCount = 0;
        lastFrameTime = now;
    }

    requestAnimationFrame(gameLoop);
}

function movePlayer() {
    if (keys['ArrowLeft']) playerPos.x -= speed;
    if (keys['ArrowRight']) playerPos.x += speed;

    // Ensure player stays within screen bounds
    if (playerPos.x < 0) playerPos.x = 0;
    if (playerPos.x > window.innerWidth - 50) playerPos.x = window.innerWidth - 50;

    // Update player position based on new playerPos.x and playerPos.y values
    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px'; // Use 'top' property to position the player
}

// Function to shoot a bullet
function shootBullet() {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');

    // Position the bullet based on the player's current position
    bullet.style.left = playerPos.x - 2 + 'px'; // Centered with the player
    bullet.style.top = playerPos.y + 15 + 'px'; // Start right above the player
    
    document.getElementById('game-container').appendChild(bullet);
    bullets.push(bullet);
}

// Function to move bullets
function moveBullets() {
    bullets.forEach((bullet, index) => {
        let topPos = parseInt(bullet.style.top);
        bullet.style.top = topPos - bulletSpeed + 'px'; // Move bullet upwards by decreasing 'top'

        // Remove bullets if they go off screen
        if (topPos < 0) {
            bullet.remove();
            bullets.splice(index, 1);
        }
    });
}

function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = Math.random() * (window.innerWidth - 30) + 'px';
    enemy.style.top = '0px';
    document.getElementById('game-container').appendChild(enemy);
    enemies.push(enemy);
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        let topPos = parseInt(enemy.style.top);
        enemy.style.top = topPos + enemySpeed + 'px';

        // If enemy reaches the bottom, player loses a life
        if (topPos > window.innerHeight - 50) {
            enemy.remove();
            enemies.splice(index, 1);
            loseLife();
        }
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        const bulletRect = bullet.getBoundingClientRect();
        enemies.forEach((enemy, enemyIndex) => {
            const enemyRect = enemy.getBoundingClientRect();
            if (
                bulletRect.left < enemyRect.right &&
                bulletRect.right > enemyRect.left &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.bottom > enemyRect.top
            ) {
                // Bullet hits enemy
                enemy.remove();
                enemies.splice(enemyIndex, 1);
                bullet.remove();
                bullets.splice(bulletIndex, 1);
                score += 100;
            }
        });
    });
}

function restartGame() {
    // Reset game variables
    score = 0;
    lives = 3;
    gameTime = 0;
    bullets = [];
    enemies = [];
    
    // Hide the game over screen
    gameOverScreen.style.display = 'none';

    // Hide the pause menu
    pauseMenu.style.display = 'none';

    // Reset UI
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    timerDisplay.textContent = gameTime;

    // Resume the game
    paused = false;
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    // Stop the game
    paused = true;
    gameOverScreen.style.display = 'block';  // Show the game over screen
    finalScoreDisplay.textContent = score;   // Display the final score

    // Hide the pause menu if it's visible
    pauseMenu.style.display = 'none';
}

// Countdown timer
setInterval(() => {
    if (!paused) {
        gameTime++;
        timerDisplay.textContent = gameTime;
    }
}, 1000);

function updateUI() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
}

// Spawn enemies at regular intervals
setInterval(() => {
    if (!paused) {
        spawnEnemy();
    }
}, enemySpawnInterval);

// Start the game loop
requestAnimationFrame(gameLoop);
