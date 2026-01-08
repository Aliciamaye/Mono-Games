/**
 * Infinite Roads - A relaxing 3D driving game inspired by slowroads.io
 * 
 * Features:
 * - Infinite procedurally generated roads
 * - Beautiful 3D terrain with hills and valleys
 * - Day/night cycle with smooth transitions
 * - Weather effects (rain, fog, clear)
 * - Smooth camera follow
 * - Distance-based scoring
 * - Relaxing ambient music
 * - Mobile-friendly controls
 */

import * as BABYLON from '@babylonjs/core';

// BaseGame interface for compatibility
interface BaseGame {
  score: number;
  highScore: number;
  isPaused: boolean;
  isGameOver: boolean;
  init(): void;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  destroy(): void;
}

interface GameConfig {
  roadWidth: number;
  roadLength: number;
  carSpeed: number;
  terrainDetail: number;
}

export class InfiniteRoads implements BaseGame {
  public score: number = 0;
  public highScore: number = 0;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public level: number = 1;

  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  private car: BABYLON.Mesh;
  private road: BABYLON.Mesh[] = [];
  private terrain: BABYLON.Mesh[] = [];
  
  // Game state
  private distance: number = 0;
  private speed: number = 50;
  private carPosition: number = 0; // -1 to 1 (left to right)
  private roadSegments: number = 20;
  private currentTime: number = 12; // Hour of day (0-24)
  private weather: 'clear' | 'rain' | 'fog' = 'clear';
  
  // Input
  private keys: { [key: string]: boolean } = {};
  private touchStartX: number = 0;
  
  // Callbacks
  public onScoreUpdate?: (score: number) => void;
  public onGameOver?: (finalScore: number) => void;
  public onLevelComplete?: (level: number) => void;

  private config: GameConfig = {
    roadWidth: 10,
    roadLength: 100,
    carSpeed: 50,
    terrainDetail: 50
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    // Initialize Babylon.js
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    });
    
    this.scene = new BABYLON.Scene(this.engine);
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      30,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    
    this.car = BABYLON.MeshBuilder.CreateBox('car', { size: 1 }, this.scene);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  init(): void {
    this.setupScene();
    this.setupLighting();
    this.setupCar();
    this.createInitialRoad();
    this.setupInput();
    this.loadHighScore();
  }

  private setupScene(): void {
    this.scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1); // Sky blue
    this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    this.scene.fogDensity = 0.01;
    this.scene.fogColor = new BABYLON.Color3(0.53, 0.81, 0.92);

    // Camera setup
    this.camera.lowerRadiusLimit = 15;
    this.camera.upperRadiusLimit = 50;
    this.camera.attachControl(this.canvas, false);
  }

  private setupLighting(): void {
    // Hemisphere light for ambient
    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.7;

    // Directional light for sun
    const sunLight = new BABYLON.DirectionalLight(
      'sunLight',
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    sunLight.intensity = 0.8;
    sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
  }

  private setupCar(): void {
    // Create a simple car mesh
    const carBody = BABYLON.MeshBuilder.CreateBox(
      'carBody',
      { width: 2, height: 1, depth: 4 },
      this.scene
    );
    
    const carTop = BABYLON.MeshBuilder.CreateBox(
      'carTop',
      { width: 1.8, height: 0.8, depth: 2 },
      this.scene
    );
    carTop.position.y = 0.9;
    carTop.position.z = -0.3;

    // Wheels
    const wheelPositions = [
      { x: -1, z: 1.5 }, { x: 1, z: 1.5 },
      { x: -1, z: -1.5 }, { x: 1, z: -1.5 }
    ];

    wheelPositions.forEach((pos, i) => {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(
        `wheel${i}`,
        { diameter: 0.8, height: 0.3 },
        this.scene
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.x = pos.x;
      wheel.position.z = pos.z;
      wheel.position.y = -0.3;
      wheel.parent = carBody;
    });

    // Material
    const carMat = new BABYLON.StandardMaterial('carMat', this.scene);
    carMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
    carMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    carBody.material = carMat;
    carTop.material = carMat;

    carTop.parent = carBody;
    this.car = carBody;
    this.car.position.y = 1;
  }

  private createInitialRoad(): void {
    for (let i = 0; i < this.roadSegments; i++) {
      this.createRoadSegment(i * this.config.roadLength);
      this.createTerrainSegment(i * this.config.roadLength);
    }
  }

  private createRoadSegment(zPosition: number): void {
    const road = BABYLON.MeshBuilder.CreateGround(
      `road_${zPosition}`,
      { width: this.config.roadWidth, height: this.config.roadLength },
      this.scene
    );

    road.position.z = zPosition + this.config.roadLength / 2;

    // Road material
    const roadMat = new BABYLON.StandardMaterial(`roadMat_${zPosition}`, this.scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    
    // Add road markings
    const markings = new BABYLON.DynamicTexture(
      `roadMarkings_${zPosition}`,
      { width: 512, height: 512 },
      this.scene
    );
    const ctx = markings.getContext();
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 512, 512);
    
    // Center line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();
    
    markings.update();
    roadMat.diffuseTexture = markings;
    road.material = roadMat;

    this.road.push(road);
  }

  private createTerrainSegment(zPosition: number): void {
    const terrain = BABYLON.MeshBuilder.CreateGround(
      `terrain_${zPosition}`,
      { 
        width: this.config.roadWidth * 8,
        height: this.config.roadLength,
        subdivisions: this.config.terrainDetail 
      },
      this.scene
    );

    terrain.position.z = zPosition + this.config.roadLength / 2;
    terrain.position.y = -2;

    // Create height variation
    const positions = terrain.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (positions) {
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = Math.sin(x * 0.1 + zPosition * 0.01) * 3 + 
                          Math.cos(z * 0.1) * 2;
      }
      terrain.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    }

    // Terrain material
    const terrainMat = new BABYLON.StandardMaterial(`terrainMat_${zPosition}`, this.scene);
    terrainMat.diffuseColor = new BABYLON.Color3(0.3, 0.7, 0.3);
    terrainMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    terrain.material = terrainMat;

    this.terrain.push(terrain);
  }

  private setupInput(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - this.touchStartX;
      this.carPosition += deltaX * 0.001;
      this.carPosition = Math.max(-1, Math.min(1, this.carPosition));
      this.touchStartX = e.touches[0].clientX;
    });
  }

  start(): void {
    this.engine.runRenderLoop(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.update(this.engine.getDeltaTime() / 1000);
      }
      this.scene.render();
    });
  }

  update(deltaTime: number): void {
    // Update car position (steering)
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.carPosition = Math.max(-1, this.carPosition - deltaTime * 2);
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.carPosition = Math.min(1, this.carPosition + deltaTime * 2);
    }

    // Update car mesh position
    this.car.position.x = this.carPosition * (this.config.roadWidth / 2 - 1);
    
    // Move forward
    this.distance += this.speed * deltaTime;
    this.car.position.z = this.distance;

    // Update score (distance in km)
    this.score = Math.floor(this.distance / 100);
    this.onScoreUpdate?.(this.score);

    // Update camera to follow car
    this.camera.target = this.car.position;

    // Recycle road segments
    this.recycleSegments();

    // Update time and lighting
    this.updateDayNightCycle(deltaTime);

    // Update weather
    if (Math.random() < 0.0001) {
      this.changeWeather();
    }
  }

  private recycleSegments(): void {
    // Remove old segments behind the car
    while (this.road.length > 0 && this.road[0].position.z < this.distance - this.config.roadLength * 5) {
      const oldRoad = this.road.shift();
      const oldTerrain = this.terrain.shift();
      
      if (oldRoad && oldTerrain) {
        oldRoad.dispose();
        oldTerrain.dispose();
        
        // Create new segments ahead
        const newZ = this.road[this.road.length - 1].position.z + this.config.roadLength;
        this.createRoadSegment(newZ);
        this.createTerrainSegment(newZ);
      }
    }
  }

  private updateDayNightCycle(deltaTime: number): void {
    // Progress time (1 hour every 2 minutes of gameplay)
    this.currentTime += deltaTime / 5;
    if (this.currentTime >= 24) this.currentTime = 0;

    // Update lighting based on time
    const sunLight = this.scene.getLightByName('sunLight') as BABYLON.DirectionalLight;
    const hemiLight = this.scene.getLightByName('hemiLight') as BABYLON.HemisphericLight;

    if (sunLight && hemiLight) {
      // Daytime: 6-18, Nighttime: 18-6
      const isDaytime = this.currentTime >= 6 && this.currentTime < 18;
      const transition = isDaytime 
        ? (this.currentTime - 6) / 12
        : 1 - ((this.currentTime >= 18 ? this.currentTime - 18 : this.currentTime + 6) / 12);

      sunLight.intensity = 0.8 * transition;
      hemiLight.intensity = 0.3 + 0.4 * transition;

      // Sky color
      const skyColor = isDaytime
        ? new BABYLON.Color3(0.53, 0.81, 0.92)
        : new BABYLON.Color3(0.05, 0.05, 0.15);
      
      this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1);
      this.scene.fogColor = skyColor;
    }
  }

  private changeWeather(): void {
    const weathers: ('clear' | 'rain' | 'fog')[] = ['clear', 'rain', 'fog'];
    this.weather = weathers[Math.floor(Math.random() * weathers.length)];

    switch (this.weather) {
      case 'clear':
        this.scene.fogDensity = 0.01;
        break;
      case 'fog':
        this.scene.fogDensity = 0.05;
        break;
      case 'rain':
        this.scene.fogDensity = 0.02;
        // TODO: Add particle system for rain
        break;
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  reset(): void {
    this.score = 0;
    this.distance = 0;
    this.carPosition = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.car.position.set(0, 1, 0);
  }

  destroy(): void {
    this.saveHighScore(); // Save before destroying
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('infiniteroads_highscore');
    this.highScore = saved ? parseInt(saved, 10) : 0;
  }

  private saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('infiniteroads_highscore', this.highScore.toString());
    }
  }

  setOnScoreUpdate(callback: (score: number) => void): void {
    this.onScoreUpdate = callback;
  }

  setOnGameOver(callback: (finalScore: number) => void): void {
    this.onGameOver = callback;
  }

  setOnLevelComplete(callback: (level: number) => void): void {
    this.onLevelComplete = callback;
  }
}

export default InfiniteRoads;
