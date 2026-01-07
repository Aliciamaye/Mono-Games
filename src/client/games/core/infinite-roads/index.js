import * as THREE from 'three';
import BaseGame from '../../shared/framework/BaseGame.js';

/**
 * Infinite Roads - A relaxing endless driving experience
 * Inspired by slowroads.io but enhanced with more features
 */
export default class InfiniteRoads extends BaseGame {
  constructor(containerId) {
    super(containerId);
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Game state
    this.speed = 0;
    this.maxSpeed = 2.0;
    this.acceleration = 0.02;
    this.carPosition = { x: 0, z: 0 };
    this.carRotation = 0;
    this.roadSegments = [];
    this.trees = [];
    this.clouds = [];
    
    // Settings
    this.viewDistance = 1000;
    this.roadWidth = 20;
    this.segmentLength = 50;
    this.numSegments = 40;
    
    // Time and environment
    this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
    this.weather = 'clear'; // clear, foggy, rainy
    
    // Colors
    this.currentTheme = 'sunset';
    this.themes = {
      sunset: {
        sky: ['#FF6B35', '#FFB347', '#87CEEB'],
        ground: '#95E1D3',
        road: '#4A4A4A',
        lines: '#FFD93D'
      },
      day: {
        sky: ['#87CEEB', '#B8E4F9', '#FFF8DC'],
        ground: '#7BC043',
        road: '#3A3A3A',
        lines: '#FFFFFF'
      },
      night: {
        sky: ['#0a0a1a', '#1a1a2e', '#16213e'],
        ground: '#1B4332',
        road: '#2A2A2A',
        lines: '#CCCCCC'
      }
    };
    
    // Controls
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false
    };
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Setup Three.js scene
    this.scene = new THREE.Scene();
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      this.viewDistance
    );
    this.camera.position.set(0, 8, -15);
    this.camera.lookAt(0, 0, 20);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Apply theme
    this.applyTheme();

    // Create world
    this.createRoad();
    this.createEnvironment();
    this.createCar();
    this.createLights();

    // Setup controls
    this.setupControls();

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());

    this.isInitialized = true;
  }

  applyTheme() {
    const theme = this.themes[this.currentTheme];
    
    // Create gradient sky
    const skyGeometry = new THREE.SphereGeometry(this.viewDistance * 0.9, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(theme.sky[0]) },
        middleColor: { value: new THREE.Color(theme.sky[1]) },
        bottomColor: { value: new THREE.Color(theme.sky[2]) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 middleColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 color;
          if (h > 0.0) {
            color = mix(middleColor, topColor, h);
          } else {
            color = mix(bottomColor, middleColor, h + 1.0);
          }
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);

    // Add fog for depth
    this.scene.fog = new THREE.FogExp2(new THREE.Color(theme.sky[1]), 0.002);
  }

  createRoad() {
    const theme = this.themes[this.currentTheme];
    
    for (let i = 0; i < this.numSegments; i++) {
      const z = i * this.segmentLength;
      
      // Road surface
      const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
      const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(theme.road),
        roughness: 0.8
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.z = z;
      this.scene.add(road);
      this.roadSegments.push(road);

      // Road lines
      if (i % 2 === 0) {
        const lineGeometry = new THREE.PlaneGeometry(0.5, this.segmentLength * 0.6);
        const lineMaterial = new THREE.MeshBasicMaterial({ 
          color: new THREE.Color(theme.lines)
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.01, z);
        this.scene.add(line);
        this.roadSegments.push(line);
      }

      // Ground on sides
      const groundGeometry = new THREE.PlaneGeometry(200, this.segmentLength);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(theme.ground),
        roughness: 0.9
      });
      
      const leftGround = new THREE.Mesh(groundGeometry, groundMaterial);
      leftGround.rotation.x = -Math.PI / 2;
      leftGround.position.set(-110, -0.1, z);
      this.scene.add(leftGround);
      this.roadSegments.push(leftGround);

      const rightGround = new THREE.Mesh(groundGeometry, groundMaterial);
      rightGround.rotation.x = -Math.PI / 2;
      rightGround.position.set(110, -0.1, z);
      this.scene.add(rightGround);
      this.roadSegments.push(rightGround);
    }
  }

  createEnvironment() {
    // Create trees along the road
    for (let i = 0; i < 100; i++) {
      const tree = this.createTree();
      const side = Math.random() > 0.5 ? 1 : -1;
      tree.position.set(
        side * (this.roadWidth / 2 + 10 + Math.random() * 50),
        0,
        Math.random() * this.numSegments * this.segmentLength
      );
      this.scene.add(tree);
      this.trees.push(tree);
    }

    // Create clouds
    for (let i = 0; i < 20; i++) {
      const cloud = this.createCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 500,
        50 + Math.random() * 100,
        Math.random() * this.numSegments * this.segmentLength
      );
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  createTree() {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 6, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    tree.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.ConeGeometry(3, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 9;
    tree.add(foliage);

    return tree;
  }

  createCloud() {
    const cloud = new THREE.Group();
    const cloudMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < 5; i++) {
      const cloudPart = new THREE.Mesh(
        new THREE.SphereGeometry(5 + Math.random() * 3, 8, 8),
        cloudMaterial
      );
      cloudPart.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 8
      );
      cloud.add(cloudPart);
    }

    return cloud;
  }

  createCar() {
    this.car = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6B35 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    this.car.add(body);

    // Car roof
    const roofGeometry = new THREE.BoxGeometry(2.5, 1, 3);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.y = 2.25;
    roof.position.z = -0.5;
    this.car.add(roof);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    
    const wheelPositions = [
      { x: -1.3, z: 1.5 },
      { x: 1.3, z: 1.5 },
      { x: -1.3, z: -1.5 },
      { x: 1.3, z: -1.5 }
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.5, pos.z);
      this.car.add(wheel);
    });

    this.car.position.y = 0.5;
    this.scene.add(this.car);
  }

  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 100, 50);
    this.scene.add(dirLight);

    // Car headlights
    const headlight1 = new THREE.SpotLight(0xffffff, 1, 50, Math.PI / 6);
    headlight1.position.set(-1, 1, 3);
    this.car.add(headlight1);

    const headlight2 = new THREE.SpotLight(0xffffff, 1, 50, Math.PI / 6);
    headlight2.position.set(1, 1, 3);
    this.car.add(headlight2);
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          this.keys.left = true;
          break;
        case 'arrowright':
        case 'd':
          this.keys.right = true;
          break;
        case 'arrowup':
        case 'w':
          this.keys.up = true;
          break;
        case 'arrowdown':
        case 's':
          this.keys.down = true;
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          this.keys.left = false;
          break;
        case 'arrowright':
        case 'd':
          this.keys.right = false;
          break;
        case 'arrowup':
        case 'w':
          this.keys.up = false;
          break;
        case 'arrowdown':
        case 's':
          this.keys.down = false;
          break;
      }
    });
  }

  update(deltaTime) {
    if (!this.isRunning || !this.car) return;

    // Update speed
    if (this.keys.up && this.speed < this.maxSpeed) {
      this.speed += this.acceleration;
    } else if (this.keys.down && this.speed > -this.maxSpeed / 2) {
      this.speed -= this.acceleration;
    } else {
      // Gradual deceleration
      this.speed *= 0.98;
    }

    // Update rotation
    if (this.keys.left && this.speed !== 0) {
      this.carRotation += 0.02 * Math.sign(this.speed);
      this.car.rotation.y = this.carRotation;
    }
    if (this.keys.right && this.speed !== 0) {
      this.carRotation -= 0.02 * Math.sign(this.speed);
      this.car.rotation.y = this.carRotation;
    }

    // Move world, keep car stationary
    const moveSpeed = this.speed;
    
    this.roadSegments.forEach(segment => {
      segment.position.z -= moveSpeed;
      
      // Recycle segments
      if (segment.position.z < -this.segmentLength) {
        segment.position.z += this.numSegments * this.segmentLength;
      }
    });

    this.trees.forEach(tree => {
      tree.position.z -= moveSpeed;
      if (tree.position.z < -50) {
        tree.position.z += this.numSegments * this.segmentLength;
      }
    });

    this.clouds.forEach(cloud => {
      cloud.position.z -= moveSpeed * 0.2;
      if (cloud.position.z < -50) {
        cloud.position.z += this.numSegments * this.segmentLength;
      }
    });

    // Update camera to follow car
    this.camera.position.x = this.car.position.x;
    this.camera.position.z = this.car.position.z - 15;

    // Update score based on distance traveled
    this.score += Math.abs(this.speed) * 10;

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    const container = document.getElementById(this.containerId);
    if (!container || !this.camera || !this.renderer) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  destroy() {
    super.destroy();
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    document.removeEventListener('keydown', this.setupControls);
    document.removeEventListener('keyup', this.setupControls);
    window.removeEventListener('resize', this.handleResize);
  }
}
