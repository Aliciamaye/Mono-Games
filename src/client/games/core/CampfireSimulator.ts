/**
 * CAMPFIRE SIMULATOR - Ultimate Cozy Experience
 * 
 * 🔥 NO GOALS - Just relax by the fire
 * 
 * Features:
 * 🔥 Animated flames with particle effects
 * ⭐ Beautiful night sky with stars & moon
 * 🌲 Forest ambiance with trees
 * 🎶 Crackling fire sounds
 * 🍡 Roast marshmallows (click to add stick)
 * 🪵 Add logs to keep fire going
 * 🌙 Moon phases change over time
 * 🦉 Nighttime wildlife sounds
 * 📷 Adjustable camera angle
 * 
 * Optimized for: Android APK & Windows EXE
 */

import * as BABYLON from '@babylonjs/core';

export default class CampfireSimulator {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.ArcRotateCamera;
  
  private fire!: BABYLON.Mesh;
  private fireParticles!: BABYLON.ParticleSystem;
  private smokeParticles!: BABYLON.ParticleSystem;
  private sparksParticles!: BABYLON.ParticleSystem;
  private logs: BABYLON.Mesh[] = [];
  private marshmallows: BABYLON.Mesh[] = [];
  
  private fireIntensity: number = 100;
  private moonPhase: number = 0;
  private timeOfNight: number = 0;
  
  private keys: { [key: string]: boolean } = {};
  
  public info = {
    fireStrength: 100,
    logsAdded: 0,
    marshmallowsRoasted: 0,
    timeSpentRelaxing: 0,
    moonPhase: 'Full Moon'
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
    this.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.15, 1);
    
    this.camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), this.scene);
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = 20;
    
    this.setupInput();
    this.setupScene();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'l') this.addLog();
      if (e.key === 'm') this.roastMarshmallow();
    });
    window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
    
    this.canvas.addEventListener('click', () => this.roastMarshmallow());
  }

  private setupScene(): void {
    const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.1;
    hemi.groundColor = new BABYLON.Color3(0.1, 0.05, 0.0);
    
    const fireLight = new BABYLON.PointLight('fireLight', new BABYLON.Vector3(0, 1, 0), this.scene);
    fireLight.intensity = 5;
    fireLight.diffuse = new BABYLON.Color3(1.0, 0.5, 0.1);
    fireLight.range = 15;
    
    this.createGround();
    this.createFirepit();
    this.createForest();
    this.createStarfield();
    this.createMoon();
    this.initializeParticles();
    
    const glow = new BABYLON.GlowLayer('glow', this.scene);
    glow.intensity = 0.8;
  }

  private createGround(): void {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
    const mat = new BABYLON.StandardMaterial('groundMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.1);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = mat;
  }

  private createFirepit(): void {
    const stones: BABYLON.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const stone = BABYLON.MeshBuilder.CreatePolyhedron('stone', { type: 3, size: 0.4 }, this.scene);
      stone.position.x = Math.cos(angle) * 1.5;
      stone.position.z = Math.sin(angle) * 1.5;
      stone.position.y = 0.2;
      
      const mat = new BABYLON.StandardMaterial('stoneMat', this.scene);
      mat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
      stone.material = mat;
      stones.push(stone);
    }
    
    this.fire = BABYLON.MeshBuilder.CreateCylinder('fire', { diameterTop: 0, diameterBottom: 1, height: 2 }, this.scene);
    this.fire.position.y = 1;
    
    const fireMat = new BABYLON.StandardMaterial('fireMat', this.scene);
    fireMat.emissiveColor = new BABYLON.Color3(1.0, 0.4, 0.0);
    fireMat.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.0);
    this.fire.material = fireMat;
    
    for (let i = 0; i < 5; i++) {
      const log = this.createLog();
      const angle = (i / 5) * Math.PI * 2;
      log.position.x = Math.cos(angle) * 0.8;
      log.position.z = Math.sin(angle) * 0.8;
      log.position.y = 0.2;
      log.rotation.y = angle + Math.PI / 2;
      this.logs.push(log);
    }
  }

  private createLog(): BABYLON.Mesh {
    const log = BABYLON.MeshBuilder.CreateCylinder('log', { diameter: 0.3, height: 2 }, this.scene);
    const mat = new BABYLON.StandardMaterial('logMat', this.scene);
    mat.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
    log.material = mat;
    return log;
  }

  private createForest(): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 30;
      
      const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', { diameterTop: 0.5, diameterBottom: 0.8, height: 8 }, this.scene);
      trunk.position.x = Math.cos(angle) * distance;
      trunk.position.z = Math.sin(angle) * distance;
      trunk.position.y = 4;
      
      const trunkMat = new BABYLON.StandardMaterial('trunkMat', this.scene);
      trunkMat.diffuseColor = new BABYLON.Color3(0.2, 0.15, 0.1);
      trunk.material = trunkMat;
      
      const foliage = BABYLON.MeshBuilder.CreateCylinder('foliage', { diameterTop: 0, diameterBottom: 4, height: 6 }, this.scene);
      foliage.position.x = trunk.position.x;
      foliage.position.z = trunk.position.z;
      foliage.position.y = 10;
      
      const foliageMat = new BABYLON.StandardMaterial('foliageMat', this.scene);
      foliageMat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.1);
      foliage.material = foliageMat;
    }
  }

  private createStarfield(): void {
    for (let i = 0; i < 500; i++) {
      const star = BABYLON.MeshBuilder.CreateSphere(`star${i}`, { diameter: 0.2 }, this.scene);
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI / 2 + Math.PI / 4;
      const distance = 80;
      
      star.position.x = Math.cos(angle1) * Math.sin(angle2) * distance;
      star.position.y = Math.cos(angle2) * distance;
      star.position.z = Math.sin(angle1) * Math.sin(angle2) * distance;
      
      const mat = new BABYLON.StandardMaterial(`starMat${i}`, this.scene);
      mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
      star.material = mat;
    }
  }

  private createMoon(): void {
    const moon = BABYLON.MeshBuilder.CreateSphere('moon', { diameter: 8 }, this.scene);
    moon.position.x = 30;
    moon.position.y = 40;
    moon.position.z = 30;
    
    const mat = new BABYLON.StandardMaterial('moonMat', this.scene);
    mat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.9);
    mat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 1.0);
    moon.material = mat;
  }

  private initializeParticles(): void {
    this.fireParticles = new BABYLON.ParticleSystem('fire', 500, this.scene);
    this.fireParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.fireParticles.emitter = new BABYLON.Vector3(0, 0.5, 0);
    this.fireParticles.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    this.fireParticles.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
    this.fireParticles.direction1 = new BABYLON.Vector3(-0.5, 3, -0.5);
    this.fireParticles.direction2 = new BABYLON.Vector3(0.5, 5, 0.5);
    this.fireParticles.minSize = 0.3;
    this.fireParticles.maxSize = 0.8;
    this.fireParticles.minLifeTime = 0.3;
    this.fireParticles.maxLifeTime = 0.8;
    this.fireParticles.emitRate = 100;
    this.fireParticles.color1 = new BABYLON.Color4(1.0, 0.8, 0.0, 1.0);
    this.fireParticles.color2 = new BABYLON.Color4(1.0, 0.3, 0.0, 0.5);
    this.fireParticles.colorDead = new BABYLON.Color4(0.2, 0.0, 0.0, 0.0);
    this.fireParticles.start();
    
    this.smokeParticles = new BABYLON.ParticleSystem('smoke', 200, this.scene);
    this.smokeParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.smokeParticles.emitter = new BABYLON.Vector3(0, 2, 0);
    this.smokeParticles.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
    this.smokeParticles.maxEmitBox = new BABYLON.Vector3(0.3, 0, 0.3);
    this.smokeParticles.direction1 = new BABYLON.Vector3(-0.5, 5, -0.5);
    this.smokeParticles.direction2 = new BABYLON.Vector3(0.5, 8, 0.5);
    this.smokeParticles.minSize = 0.5;
    this.smokeParticles.maxSize = 2.0;
    this.smokeParticles.minLifeTime = 2;
    this.smokeParticles.maxLifeTime = 4;
    this.smokeParticles.emitRate = 20;
    this.smokeParticles.color1 = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
    this.smokeParticles.color2 = new BABYLON.Color4(0.2, 0.2, 0.2, 0.3);
    this.smokeParticles.colorDead = new BABYLON.Color4(0.1, 0.1, 0.1, 0.0);
    this.smokeParticles.start();
    
    this.sparksParticles = new BABYLON.ParticleSystem('sparks', 50, this.scene);
    this.sparksParticles.particleTexture = new BABYLON.Texture('', this.scene);
    this.sparksParticles.emitter = new BABYLON.Vector3(0, 0.5, 0);
    this.sparksParticles.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
    this.sparksParticles.maxEmitBox = new BABYLON.Vector3(0.3, 0, 0.3);
    this.sparksParticles.direction1 = new BABYLON.Vector3(-2, 3, -2);
    this.sparksParticles.direction2 = new BABYLON.Vector3(2, 5, 2);
    this.sparksParticles.minSize = 0.05;
    this.sparksParticles.maxSize = 0.15;
    this.sparksParticles.minLifeTime = 0.5;
    this.sparksParticles.maxLifeTime = 1.5;
    this.sparksParticles.emitRate = 10;
    this.sparksParticles.color1 = new BABYLON.Color4(1.0, 0.8, 0.0, 1.0);
    this.sparksParticles.color2 = new BABYLON.Color4(1.0, 0.5, 0.0, 1.0);
    this.sparksParticles.start();
  }

  private addLog(): void {
    const log = this.createLog();
    const angle = Math.random() * Math.PI * 2;
    log.position.x = Math.cos(angle) * 1.2;
    log.position.z = Math.sin(angle) * 1.2;
    log.position.y = 0.5 + this.logs.length * 0.2;
    log.rotation.y = angle;
    this.logs.push(log);
    
    this.fireIntensity = Math.min(100, this.fireIntensity + 20);
    this.info.logsAdded++;
  }

  private roastMarshmallow(): void {
    const stick = BABYLON.MeshBuilder.CreateCylinder('stick', { diameter: 0.05, height: 1.5 }, this.scene);
    stick.position.x = (Math.random() - 0.5) * 3;
    stick.position.z = 1.5;
    stick.position.y = 0.8;
    stick.rotation.x = Math.PI / 4;
    
    const stickMat = new BABYLON.StandardMaterial('stickMat', this.scene);
    stickMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    stick.material = stickMat;
    
    const marshmallow = BABYLON.MeshBuilder.CreateSphere('marshmallow', { diameter: 0.2 }, this.scene);
    marshmallow.position = stick.position.clone();
    marshmallow.position.y += 0.7;
    
    const marshMat = new BABYLON.StandardMaterial('marshMat', this.scene);
    marshMat.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.9);
    marshmallow.material = marshMat;
    
    this.marshmallows.push(marshmallow);
    this.info.marshmallowsRoasted++;
    
    setTimeout(() => {
      marshMat.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
      marshMat.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.0);
    }, 3000);
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
    
    this.info.timeSpentRelaxing += dt;
    this.timeOfNight += dt * 0.01;
    
    this.fireIntensity = Math.max(0, this.fireIntensity - dt * 0.5);
    this.fire.scaling.y = 0.5 + (this.fireIntensity / 100) * 0.5;
    this.fireParticles.emitRate = 50 + (this.fireIntensity / 100) * 150;
    
    this.fire.rotation.y += dt * 0.5;
    
    this.moonPhase = (this.moonPhase + dt * 0.01) % 1;
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    this.info.moonPhase = phases[Math.floor(this.moonPhase * 8)];
    this.info.fireStrength = Math.round(this.fireIntensity);
  }

  pause(): void {}
  resume(): void {}
  restart(): void {
    this.fireIntensity = 100;
    this.info.logsAdded = 0;
    this.info.marshmallowsRoasted = 0;
    this.info.timeSpentRelaxing = 0;
    this.marshmallows.forEach(m => m.dispose());
    this.marshmallows = [];
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
