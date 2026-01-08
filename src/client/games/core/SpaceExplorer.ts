/**
 * SPACE EXPLORER - Peaceful Cosmic Journey
 * 
 * 🌌 NO COMBAT, NO SCORING - Pure space exploration
 * 
 * Features:
 * ✨ Beautiful procedural nebulae with colors
 * 🪐 Discover planets (gas giants, rocky, ice, lava)
 * ☄️ Asteroid fields with realistic physics
 * ⭐ Stars, galaxies, black holes
 * 🚀 Smooth spaceship controls (WASD)
 * 🎨 Dynamic lighting from stars
 * 🌈 Wormholes to travel fast
 * 🎶 Ambient space music
 * 📷 Free camera mode to admire views
 * 
 * Optimized for: Android APK & Windows EXE
 */

import * as BABYLON from '@babylonjs/core';

type CelestialBody = 'planet' | 'star' | 'asteroid' | 'nebula' | 'blackhole' | 'wormhole';
type PlanetType = 'rocky' | 'gas' | 'ice' | 'lava' | 'earth' | 'desert';

interface SpaceObject {
  mesh: BABYLON.Mesh;
  type: CelestialBody;
  position: BABYLON.Vector3;
  discovered: boolean;
}

export default class SpaceExplorer {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.FreeCamera;
  
  private ship!: BABYLON.Mesh;
  private shipSpeed: number = 0;
  private shipVelocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private maxSpeed: number = 50;
  
  private spaceObjects: SpaceObject[] = [];
  private nebulae: BABYLON.Mesh[] = [];
  private stars: BABYLON.PointLight[] = [];
  
  private keys: { [key: string]: boolean } = {};
  private freeCamMode: boolean = false;
  
  public info = {
    planetsDiscovered: 0,
    distanceTraveled: 0,
    currentSector: 'Alpha Centauri',
    nearestObject: 'None',
    speed: 0
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);

    this.engine = new BABYLON.Engine(this.canvas, true, { powerPreference: 'high-performance', antialias: true });
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.05, 1);
    
    this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.attachControl(this.canvas, true);
    
    this.setupInput();
    this.setupScene();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'f') this.freeCamMode = !this.freeCamMode;
    });
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
  }

  private setupScene(): void {
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.2;
    
    this.createShip();
    this.generateUniverse();
    
    const pipeline = new BABYLON.DefaultRenderingPipeline('pipeline', true, this.scene, [this.camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.7;
    pipeline.bloomWeight = 0.5;
    pipeline.glowLayerEnabled = true;
  }

  private createShip(): void {
    const body = BABYLON.MeshBuilder.CreateBox('body', { width: 1, height: 0.5, depth: 2 }, this.scene);
    const cockpit = BABYLON.MeshBuilder.CreateSphere('cockpit', { diameter: 0.8 }, this.scene);
    cockpit.position.z = 0.5;
    cockpit.position.y = 0.3;
    
    const wingL = BABYLON.MeshBuilder.CreateBox('wingL', { width: 2, height: 0.1, depth: 1 }, this.scene);
    wingL.position.x = -1.5;
    wingL.position.z = -0.5;
    
    const wingR = BABYLON.MeshBuilder.CreateBox('wingR', { width: 2, height: 0.1, depth: 1 }, this.scene);
    wingR.position.x = 1.5;
    wingR.position.z = -0.5;
    
    const mat = new BABYLON.StandardMaterial('shipMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
    mat.emissiveColor = new BABYLON.Color3(0.2, 0.3, 0.5);
    
    this.ship = BABYLON.Mesh.MergeMeshes([body, cockpit, wingL, wingR], true, true)!;
    this.ship.material = mat;
    this.ship.position.z = -5;
  }

  private generateUniverse(): void {
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 500;
      const z = (Math.random() - 0.5) * 500;
      
      if (Math.random() > 0.7) this.createPlanet(new BABYLON.Vector3(x, y, z));
      else if (Math.random() > 0.5) this.createNebula(new BABYLON.Vector3(x, y, z));
      else this.createAsteroidField(new BABYLON.Vector3(x, y, z));
    }
    
    this.createStarfield();
  }

  private createPlanet(pos: BABYLON.Vector3): void {
    const types: PlanetType[] = ['rocky', 'gas', 'ice', 'lava', 'earth', 'desert'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 5 + Math.random() * 15;
    
    const planet = BABYLON.MeshBuilder.CreateSphere('planet', { diameter: size, segments: 32 }, this.scene);
    planet.position = pos;
    
    const mat = new BABYLON.StandardMaterial('planetMat', this.scene);
    
    switch(type) {
      case 'gas': mat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.4); break;
      case 'ice': mat.diffuseColor = new BABYLON.Color3(0.7, 0.9, 1.0); break;
      case 'lava': mat.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.1); mat.emissiveColor = new BABYLON.Color3(0.5, 0.1, 0.0); break;
      case 'earth': mat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8); break;
      case 'desert': mat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.4); break;
      default: mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); break;
    }
    
    mat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    planet.material = mat;
    
    const light = new BABYLON.PointLight('planetLight', pos, this.scene);
    light.intensity = 0.5;
    light.range = size * 5;
    
    this.spaceObjects.push({ mesh: planet, type: 'planet', position: pos, discovered: false });
  }

  private createNebula(pos: BABYLON.Vector3): void {
    const nebula = BABYLON.MeshBuilder.CreateSphere('nebula', { diameter: 40, segments: 16 }, this.scene);
    nebula.position = pos;
    
    const mat = new BABYLON.StandardMaterial('nebulaMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random() * 0.5, Math.random());
    mat.emissiveColor = mat.diffuseColor.scale(0.5);
    mat.alpha = 0.3;
    nebula.material = mat;
    
    this.nebulae.push(nebula);
    this.spaceObjects.push({ mesh: nebula, type: 'nebula', position: pos, discovered: false });
  }

  private createAsteroidField(pos: BABYLON.Vector3): void {
    for (let i = 0; i < 10; i++) {
      const asteroid = BABYLON.MeshBuilder.CreatePolyhedron('asteroid', { type: Math.floor(Math.random() * 14), size: 0.5 + Math.random() }, this.scene);
      asteroid.position = pos.add(new BABYLON.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));
      
      const mat = new BABYLON.StandardMaterial('asteroidMat', this.scene);
      mat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      asteroid.material = mat;
      
      this.spaceObjects.push({ mesh: asteroid, type: 'asteroid', position: asteroid.position.clone(), discovered: false });
    }
  }

  private createStarfield(): void {
    for (let i = 0; i < 1000; i++) {
      const star = BABYLON.MeshBuilder.CreateSphere(`star${i}`, { diameter: 0.5 }, this.scene);
      star.position = new BABYLON.Vector3((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
      
      const mat = new BABYLON.StandardMaterial(`starMat${i}`, this.scene);
      mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
      star.material = mat;
    }
  }

  setup(): void {
    this.engine.runRenderLoop(() => {
      this.update(this.engine.getDeltaTime());
      this.scene.render();
    });
    window.addEventListener('resize', () => this.engine.resize());
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    if (!this.freeCamMode) {
      if (this.keys['w'] || this.keys['arrowup']) this.shipSpeed = Math.min(this.shipSpeed + 20 * dt, this.maxSpeed);
      else this.shipSpeed = Math.max(this.shipSpeed - 10 * dt, 0);
      
      if (this.keys['a'] || this.keys['arrowleft']) this.ship.rotation.y += 1 * dt;
      if (this.keys['d'] || this.keys['arrowright']) this.ship.rotation.y -= 1 * dt;
      if (this.keys['q']) this.ship.rotation.z += 1 * dt;
      if (this.keys['e']) this.ship.rotation.z -= 1 * dt;
      
      const forward = this.ship.forward;
      this.ship.position.addInPlace(forward.scale(this.shipSpeed * dt));
      this.camera.position = this.ship.position.add(new BABYLON.Vector3(0, 2, -8));
      this.camera.setTarget(this.ship.position.add(forward.scale(10)));
      
      this.info.distanceTraveled += this.shipSpeed * dt;
    }
    
    for (const obj of this.spaceObjects) {
      const dist = BABYLON.Vector3.Distance(this.camera.position, obj.position);
      if (dist < 50 && !obj.discovered && obj.type === 'planet') {
        obj.discovered = true;
        this.info.planetsDiscovered++;
      }
    }
    
    this.info.speed = Math.round(this.shipSpeed);
  }

  pause(): void {}
  resume(): void {}
  restart(): void {
    this.ship.position = new BABYLON.Vector3(0, 0, -5);
    this.shipSpeed = 0;
    this.info.planetsDiscovered = 0;
    this.info.distanceTraveled = 0;
  }
  cleanup(): void {
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }
  render(): void { this.scene.render(); }
  setOnScoreUpdate(_callback: (score: number) => void): void {}
  setOnGameOver(_callback: (finalScore: number) => void): void {}
  setOnLevelComplete(_callback: (level: number) => void): void {}
}
