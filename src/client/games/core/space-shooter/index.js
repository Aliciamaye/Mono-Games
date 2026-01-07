import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Space Shooter - Classic arcade shooter with waves of enemies
 */
export default class SpaceShooter extends BaseGame {
    constructor(containerId) {
        super(containerId, 'space-shooter', 600, 800);

        this.player = { x: 300, y: 700, width: 40, height: 40, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.enemyBullets = [];
        
        this.wave = 1;
        this.enemiesPerWave = 5;
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = 2000;
        
        this.keys = { left: false, right: false, space: false };
        this.canShoot = true;
        this.shootCooldown = 250;
    }

    setup() {
        this.setupControls();
        this.spawnWave();
    }

    setupControls() {
        this.addKeyHandler('ArrowLeft', () => { this.keys.left = true; }, 'keydown');
        this.addKeyHandler('ArrowLeft', () => { this.keys.left = false; }, 'keyup');
        this.addKeyHandler('ArrowRight', () => { this.keys.right = true; }, 'keydown');
        this.addKeyHandler('ArrowRight', () => { this.keys.right = false; }, 'keyup');
        this.addKeyHandler('a', () => { this.keys.left = true; }, 'keydown');
        this.addKeyHandler('a', () => { this.keys.left = false; }, 'keyup');
        this.addKeyHandler('d', () => { this.keys.right = true; }, 'keydown');
        this.addKeyHandler('d', () => { this.keys.right = false; }, 'keyup');
        this.addKeyHandler(' ', () => { this.shoot(); });
    }

    spawnWave() {
        const enemiesInWave = this.enemiesPerWave + Math.floor(this.wave * 1.5);
        for (let i = 0; i < enemiesInWave; i++) {
            setTimeout(() => {
                this.spawnEnemy();
            }, i * 500);
        }
    }

    spawnEnemy() {
        const type = Math.random();
        let enemy;

        if (type < 0.6) {
            // Basic enemy
            enemy = {
                x: Math.random() * (this.canvas.width - 40),
                y: -40,
                width: 35,
                height: 35,
                speed: 1 + this.wave * 0.2,
                health: 1,
                type: 'basic',
                color: '#FF6B6B',
                points: 10
            };
        } else if (type < 0.85) {
            // Fast enemy
            enemy = {
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 25,
                height: 25,
                speed: 2.5 + this.wave * 0.3,
                health: 1,
                type: 'fast',
                color: '#4ECDC4',
                points: 20
            };
        } else {
            // Tank enemy
            enemy = {
                x: Math.random() * (this.canvas.width - 50),
                y: -50,
                width: 50,
                height: 50,
                speed: 0.5 + this.wave * 0.1,
                health: 3,
                type: 'tank',
                color: '#95E1D3',
                points: 50
            };
        }

        enemy.shootTimer = Math.random() * 3000;
        this.enemies.push(enemy);
    }

    shoot() {
        if (!this.canShoot) return;

        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 15,
            speed: 8
        });

        this.canShoot = false;
        setTimeout(() => { this.canShoot = true; }, this.shootCooldown);
    }

    update(deltaTime) {
        // Player movement
        if (this.keys.left) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys.right) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;

            // Enemy shooting
            enemy.shootTimer -= deltaTime;
            if (enemy.shootTimer <= 0) {
                this.enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 12,
                    speed: 3
                });
                enemy.shootTimer = 2000 + Math.random() * 2000;
            }

            // Remove if off screen
            if (enemy.y > this.canvas.height) {
                this.lives = Math.max(0, (this.lives || 3) - 1);
                return false;
            }
            return true;
        });

        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;

            // Check collision with player
            if (this.checkCollision(bullet, this.player)) {
                this.lives = Math.max(0, (this.lives || 3) - 1);
                this.createExplosion(bullet.x, bullet.y, '#FF6B6B');
                return false;
            }

            return bullet.y < this.canvas.height;
        });

        // Check bullet-enemy collisions
        this.bullets.forEach((bullet, bIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    enemy.health -= 1;
                    this.bullets.splice(bIndex, 1);

                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                        this.enemies.splice(eIndex, 1);
                    }
                }
            });
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= deltaTime;
            return p.life > 0;
        });

        // Check if wave complete
        if (this.enemies.length === 0 && !this.waveComplete) {
            this.waveComplete = true;
            setTimeout(() => {
                this.wave += 1;
                this.score += 100 * this.wave;
                this.spawnWave();
                this.waveComplete = false;
            }, 2000);
        }

        // Check game over
        if (this.lives !== undefined && this.lives <= 0) {
            this.gameOver = true;
        }
    }

    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color,
                life: 500
            });
        }
    }

    render() {
        this.clearCanvas();

        // Space background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Stars
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 197 + Date.now() * 0.01) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2);
        }

        // Player
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Player bullets
        this.ctx.fillStyle = '#4ECDC4';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            // Health bar for tanks
            if (enemy.type === 'tank' && enemy.health < 3) {
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.fillRect(enemy.x, enemy.y - 5, enemy.width * (enemy.health / 3), 3);
            }
        });

        // Enemy bullets
        this.ctx.fillStyle = '#FF6B6B';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / 500;
            this.ctx.fillRect(p.x, p.y, 3, 3);
            this.ctx.globalAlpha = 1;
        });

        // HUD
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        this.ctx.fillText(`Wave: ${this.wave}`, 10, 50);
        this.ctx.fillText(`Lives: ${this.lives || 3}`, 10, 75);

        // Wave complete message
        if (this.waveComplete) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
            this.ctx.fillStyle = '#4ECDC4';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Wave ${this.wave} Complete!`, this.canvas.width / 2, this.canvas.height / 2);
        }

        // Game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 60, this.canvas.width, 120);
            this.ctx.fillStyle = '#FF6B6B';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
}
