import * as THREE from 'three';
import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Cube Runner - Fast-paced 3D obstacle avoidance game
 */
export default class CubeRunner extends BaseGame {
    constructor(containerId) {
        super(containerId, 'cube-runner', 800, 600);

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.obstacles = [];
        this.pickups = [];
        
        this.playerX = 0;
        this.speed = 0.2;
        this.speedIncrease = 0.001;
        this.keys = { left: false, right: false };
    }

    setup() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000033, 1, 100);

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.width / this.canvas.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true 
        });
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setClearColor(0x000033);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);

        // Player cube
        const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
        const playerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.2
        });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 0, 0);
        this.scene.add(this.player);

        // Ground grid
        const gridHelper = new THREE.GridHelper(100, 50, 0x00ff00, 0x004400);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);

        this.setupControls();
        this.spawnObstacle();
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
    }

    spawnObstacle() {
        if (Math.random() < 0.7) {
            // Spawn obstacle
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.3
            });
            const obstacle = new THREE.Mesh(geometry, material);
            
            const lanes = [-3, -1.5, 0, 1.5, 3];
            obstacle.position.set(
                lanes[Math.floor(Math.random() * lanes.length)],
                0,
                -50
            );
            
            this.scene.add(obstacle);
            this.obstacles.push({ mesh: obstacle, type: 'obstacle' });
        } else {
            // Spawn pickup
            const geometry = new THREE.SphereGeometry(0.5);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.5
            });
            const pickup = new THREE.Mesh(geometry, material);
            
            const lanes = [-3, -1.5, 0, 1.5, 3];
            pickup.position.set(
                lanes[Math.floor(Math.random() * lanes.length)],
                0,
                -50
            );
            
            this.scene.add(pickup);
            this.obstacles.push({ mesh: pickup, type: 'pickup' });
        }
    }

    update(deltaTime) {
        // Player movement
        const moveSpeed = 0.15;
        if (this.keys.left) {
            this.playerX = Math.max(-3, this.playerX - moveSpeed);
        }
        if (this.keys.right) {
            this.playerX = Math.min(3, this.playerX + moveSpeed);
        }
        
        // Smooth player position
        this.player.position.x += (this.playerX - this.player.position.x) * 0.1;

        // Rotate player
        this.player.rotation.y += 0.05;

        // Move obstacles
        this.obstacles = this.obstacles.filter(obj => {
            obj.mesh.position.z += this.speed;

            // Rotate pickups
            if (obj.type === 'pickup') {
                obj.mesh.rotation.y += 0.1;
            }

            // Check collision with player
            const distance = Math.sqrt(
                Math.pow(obj.mesh.position.x - this.player.position.x, 2) +
                Math.pow(obj.mesh.position.z - this.player.position.z, 2)
            );

            if (distance < 1) {
                if (obj.type === 'obstacle') {
                    this.gameOver = true;
                    this.isRunning = false;
                } else if (obj.type === 'pickup') {
                    this.score += 10;
                    this.scene.remove(obj.mesh);
                    return false;
                }
            }

            // Remove if passed
            if (obj.mesh.position.z > 10) {
                this.scene.remove(obj.mesh);
                if (obj.type === 'obstacle') {
                    this.score += 1;
                }
                return false;
            }

            return true;
        });

        // Spawn new obstacles
        if (Math.random() < 0.02) {
            this.spawnObstacle();
        }

        // Increase speed
        this.speed += this.speedIncrease;

        // Update camera shake effect
        this.camera.position.x = Math.sin(Date.now() * 0.001) * 0.1;
    }

    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        // Draw HUD on canvas overlay
        if (!this.ctx) {
            return;
        }

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Speed: ${(this.speed * 100).toFixed(1)}`, 10, 60);

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
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

    cleanup() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.obstacles.forEach(obj => {
            if (obj.mesh.geometry) obj.mesh.geometry.dispose();
            if (obj.mesh.material) obj.mesh.material.dispose();
        });
    }
}
