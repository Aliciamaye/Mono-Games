import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Platformer - Classic side-scrolling platformer with collectibles
 */
export default class Platformer extends BaseGame {
    constructor(containerId) {
        super(containerId, 'platformer', 800, 600);

        this.player = {
            x: 50,
            y: 400,
            width: 30,
            height: 40,
            velocityX: 0,
            velocityY: 0,
            speed: 4,
            jumpPower: 12,
            onGround: false
        };

        this.keys = { left: false, right: false, up: false };
        this.gravity = 0.5;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.cameraX = 0;
        this.level = 1;
    }

    setup() {
        this.generateLevel();
        this.setupControls();
    }

    setupControls() {
        this.addKeyHandler('ArrowLeft', () => { this.keys.left = true; }, 'keydown');
        this.addKeyHandler('ArrowLeft', () => { this.keys.left = false; }, 'keyup');
        this.addKeyHandler('ArrowRight', () => { this.keys.right = true; }, 'keydown');
        this.addKeyHandler('ArrowRight', () => { this.keys.right = false; }, 'keyup');
        this.addKeyHandler('ArrowUp', () => { this.keys.up = true; }, 'keydown');
        this.addKeyHandler('ArrowUp', () => { this.keys.up = false; }, 'keyup');
        this.addKeyHandler('a', () => { this.keys.left = true; }, 'keydown');
        this.addKeyHandler('a', () => { this.keys.left = false; }, 'keyup');
        this.addKeyHandler('d', () => { this.keys.right = true; }, 'keydown');
        this.addKeyHandler('d', () => { this.keys.right = false; }, 'keyup');
        this.addKeyHandler('w', () => { this.keys.up = true; }, 'keydown');
        this.addKeyHandler('w', () => { this.keys.up = false; }, 'keyup');
        this.addKeyHandler(' ', () => { this.jump(); });
    }

    generateLevel() {
        this.platforms = [];
        this.coins = [];
        this.enemies = [];

        // Ground
        this.platforms.push({ x: 0, y: 550, width: 3000, height: 50, color: '#8B4513' });

        // Platforms
        const platformData = [
            { x: 200, y: 450, width: 150 },
            { x: 450, y: 350, width: 100 },
            { x: 650, y: 400, width: 120 },
            { x: 850, y: 300, width: 150 },
            { x: 1100, y: 250, width: 100 },
            { x: 1300, y: 350, width: 150 },
            { x: 1550, y: 300, width: 120 },
            { x: 1800, y: 400, width: 150 },
            { x: 2050, y: 250, width: 100 },
            { x: 2300, y: 350, width: 150 },
            { x: 2550, y: 450, width: 150 }
        ];

        platformData.forEach(p => {
            this.platforms.push({ ...p, height: 20, color: '#6B8E23' });
        });

        // Coins
        for (let i = 0; i < 30; i++) {
            const platform = platformData[Math.floor(Math.random() * platformData.length)];
            this.coins.push({
                x: platform.x + Math.random() * platform.width,
                y: platform.y - 40,
                width: 20,
                height: 20,
                collected: false
            });
        }

        // Enemies
        for (let i = 0; i < 8; i++) {
            const platform = platformData[Math.floor(Math.random() * platformData.length)];
            this.enemies.push({
                x: platform.x + 20,
                y: platform.y - 30,
                width: 30,
                height: 30,
                velocityX: 1.5,
                minX: platform.x,
                maxX: platform.x + platform.width - 30
            });
        }
    }

    jump() {
        if (this.player.onGround) {
            this.player.velocityY = -this.player.jumpPower;
            this.player.onGround = false;
        }
    }

    update(deltaTime) {
        // Player horizontal movement
        if (this.keys.left) {
            this.player.velocityX = -this.player.speed;
        } else if (this.keys.right) {
            this.player.velocityX = this.player.speed;
        } else {
            this.player.velocityX *= 0.8;
        }

        // Apply gravity
        this.player.velocityY += this.gravity;

        // Update player position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;

        // Platform collisions
        this.player.onGround = false;
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0 && this.player.y + this.player.height - this.player.velocityY <= platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onGround = true;
                }
            }
        });

        // Coin collection
        this.coins.forEach(coin => {
            if (!coin.collected && this.checkCollision(this.player, coin)) {
                coin.collected = true;
                this.score += 10;
            }
        });

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.x += enemy.velocityX;
            if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
                enemy.velocityX *= -1;
            }

            // Check collision with player
            if (this.checkCollision(this.player, enemy)) {
                // Simple knockback
                if (this.player.y + this.player.height < enemy.y + 15 && this.player.velocityY > 0) {
                    // Stomp enemy
                    this.score += 50;
                    enemy.x = -1000; // Remove enemy
                    this.player.velocityY = -8;
                } else {
                    // Take damage
                    this.player.x = 50;
                    this.player.y = 400;
                    this.score = Math.max(0, this.score - 25);
                }
            }
        });

        // Camera follows player
        this.cameraX = Math.max(0, this.player.x - this.canvas.width / 3);

        // Check level complete
        if (this.player.x > 2700) {
            this.level += 1;
            this.score += 500;
            this.player.x = 50;
            this.player.y = 400;
            this.generateLevel();
        }

        // Fall off map
        if (this.player.y > this.canvas.height) {
            this.player.x = 50;
            this.player.y = 400;
            this.player.velocityY = 0;
            this.score = Math.max(0, this.score - 50);
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    render() {
        this.clearCanvas();

        // Sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 300 - this.cameraX * 0.5) % this.canvas.width;
            this.ctx.beginPath();
            this.ctx.arc(x, 50 + i * 30, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 30, 50 + i * 30, 40, 0, Math.PI * 2);
            this.ctx.arc(x + 60, 50 + i * 30, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Save context
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        // Platforms
        this.platforms.forEach(platform => {
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Coins
        this.ctx.fillStyle = '#FFD700';
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Enemies
        this.ctx.fillStyle = '#FF6B6B';
        this.enemies.forEach(enemy => {
            if (enemy.x > -1000) {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                // Eyes
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6);
                this.ctx.fillRect(enemy.x + 16, enemy.y + 8, 6, 6);
                this.ctx.fillStyle = '#FF6B6B';
            }
        });

        // Player
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Restore context
        this.ctx.restore();

        // HUD
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Level: ${this.level}`, 10, 60);

        // Controls hint
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillText('Arrow Keys / WASD to move, Space to jump', 10, this.canvas.height - 10);
    }
}
