// ============================================================================
// AR Services Module for MoodMash
// Advanced AR features: Meditation, Yoga, Mood Visualization, Social
// ============================================================================

import * as THREE from 'three';

// ============================================================================
// AR Types and Interfaces
// ============================================================================

export interface ARConfig {
  enableSpatialAudio: boolean;
  enablePoseDetection: boolean;
  enableEmotionTracking: boolean;
  environmentQuality: 'low' | 'medium' | 'high';
  frameRate: number;
}

export interface ARSession {
  id: string;
  type: ARSessionType;
  userId: string;
  startTime: Date;
  endTime?: Date;
  environment: AREnvironment;
  metrics: ARMetrics;
}

export type ARSessionType = 'meditation' | 'yoga' | 'mood' | 'social' | 'fitness';

export interface AREnvironment {
  type: EnvironmentType;
  timeOfDay: TimeOfDay;
  weather: Weather;
  customElements?: string[];
  ambientSound?: string;
  lighting?: LightingConfig;
}

export type EnvironmentType = 'nature' | 'ocean' | 'mountain' | 'forest' | 'space' | 'beach' | 'garden' | 'temple' | 'custom';
export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night' | 'twilight';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'stars' | 'fog' | 'aurora';

export interface LightingConfig {
  intensity: number;
  color: string;
  shadows: boolean;
  ambientColor: string;
  sunPosition: { x: number; y: number; z: number };
}

export interface ARMetrics {
  duration: number;
  accuracy?: number;
  calories?: number;
  heartRate?: number;
  mindfulnessScore?: number;
  moodScore?: number;
  engagementLevel: number;
  achievements: string[];
}

// ============================================================================
// Spatial Audio System
// ============================================================================

export class SpatialAudioSystem {
  private audioContext: AudioContext | null = null;
  private listener: AudioListener | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private panners: Map<string, PannerNode> = new Map();
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
      this.listener = this.audioContext.listener;
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.isEnabled = true;
    }
  }

  /**
   * Initialize spatial audio
   */
  async initialize(): Promise<boolean> {
    if (!this.audioContext) return false;

    try {
      await this.audioContext.resume();

      if (this.listener.positionX) {
        this.listener.positionX.value = 0;
        this.listener.positionY.value = 0;
        this.listener.positionZ.value = 0;
      }

      return this.isEnabled;
    } catch (error) {
      console.error('Spatial audio initialization failed:', error);
      return false;
    }
  }

  /**
   * Create 3D audio source
   */
  async createSpatialSource(
    id: string,
    audioUrl: string,
    position: { x: number; y: number; z: number },
    options?: { loop?: boolean; volume?: number; refDistance?: number }
  ): Promise<boolean> {
    if (!this.audioContext || !this.isEnabled) return false;

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = options?.loop ?? true;

      const panner = this.audioContext.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = options?.refDistance ?? 1;
      panner.maxDistance = 100;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 360;
      panner.coneOuterGain = 0;

      if (panner.positionX) {
        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;
      }

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options?.volume ?? 0.7;

      source.connect(panner);
      panner.connect(gainNode);
      gainNode.connect(this.masterGain!);

      this.sources.set(id, source);
      this.panners.set(id, panner);

      source.start();

      return true;
    } catch (error) {
      console.error('Failed to create spatial source:', error);
      return false;
    }
  }

  /**
   * Update source position
   */
  updateSourcePosition(id: string, position: { x: number; y: number; z: number }): void {
    const panner = this.panners.get(id);
    if (panner && panner.positionX) {
      panner.positionX.value = position.x;
      panner.positionY.value = position.y;
      panner.positionZ.value = position.z;
    }
  }

  /**
   * Update listener position (user position)
   */
  updateListenerPosition(position: { x: number; y: number; z: number }, orientation: { x: number; y: number; z: number }): void {
    if (this.listener && this.listener.positionX) {
      this.listener.positionX.value = position.x;
      this.listener.positionY.value = position.y;
      this.listener.positionZ.value = position.z;
      this.listener.forwardX.value = orientation.x;
      this.listener.forwardY.value = orientation.y;
      this.listener.forwardZ.value = orientation.z;
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Stop all audio
   */
  stopAll(): void {
    this.sources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source may already be stopped
      }
    });
    this.sources.clear();
    this.panners.clear();
  }

  /**
   * Check if audio is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }
}

// ============================================================================
// Three.js Scene Manager for AR Environments
// ============================================================================

export class ARSceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private environment: AREnvironment;
  private objects: Map<string, THREE.Object3D> = new Map();
  private particleSystems: Map<string, THREE.Points> = new Map();
  private clock: THREE.Clock;

  constructor(container: HTMLElement, environment: AREnvironment) {
    this.container = container;
    this.environment = environment;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupEnvironment();
    this.setupFog();
    this.animate();
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(this.environment.lighting.ambientColor, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      this.environment.lighting.color,
      this.environment.lighting.intensity
    );
    directionalLight.position.set(
      this.environment.lighting.sunPosition.x,
      this.environment.lighting.sunPosition.y,
      this.environment.lighting.sunPosition.z
    );
    directionalLight.castShadow = this.environment.lighting.shadows;
    this.scene.add(directionalLight);

    if (this.environment.timeOfDay === 'sunset') {
      const sunsetLight = new THREE.PointLight(0xff6b35, 0.5, 100);
      sunsetLight.position.set(-10, 5, 0);
      this.scene.add(sunsetLight);
    }
  }

  /**
   * Setup environment based on type
   */
  private setupEnvironment(): void {
    switch (this.environment.type) {
      case 'nature':
        this.createNatureEnvironment();
        break;
      case 'ocean':
        this.createOceanEnvironment();
        break;
      case 'forest':
        this.createForestEnvironment();
        break;
      case 'space':
        this.createSpaceEnvironment();
        break;
      case 'beach':
        this.createBeachEnvironment();
        break;
      case 'temple':
        this.createTempleEnvironment();
        break;
      default:
        this.createNatureEnvironment();
    }
  }

  /**
   * Create nature environment
   */
  private createNatureEnvironment(): void {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3d5c3d });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Trees
    for (let i = 0; i < 20; i++) {
      const tree = this.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 40,
        0,
        -20 + Math.random() * -30
      );
      tree.scale.setScalar(0.5 + Math.random() * 0.5);
      this.scene.add(tree);
    }

    // Flowers
    for (let i = 0; i < 50; i++) {
      const flower = this.createFlower();
      flower.position.set(
        (Math.random() - 0.5) * 30,
        0.1,
        -10 + Math.random() * -20
      );
      this.scene.add(flower);
    }
  }

  /**
   * Create tree mesh
   */
  private createTree(): THREE.Group {
    const group = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 3.5;
    foliage.castShadow = true;
    group.add(foliage);

    return group;
  }

  /**
   * Create flower mesh
   */
  private createFlower(): THREE.Group {
    const group = new THREE.Group();

    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    group.add(stem);

    const petalGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xff69b4 : 0xffd700 });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.y = 0.5;
    group.add(petal);

    return group;
  }

  /**
   * Create ocean environment
   */
  private createOceanEnvironment(): void {
    // Water surface
    const waterGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077b6,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.5
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    this.scene.add(water);

    // Beach sand
    const sandGeometry = new THREE.PlaneGeometry(100, 20);
    const sandMaterial = new THREE.MeshStandardMaterial({ color: 0xf4d03f });
    const sand = new THREE.Mesh(sandGeometry, sandMaterial);
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -1.1;
    sand.position.z = 10;
    this.scene.add(sand);
  }

  /**
   * Create forest environment
   */
  private createForestEnvironment(): void {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a4d1a });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Dense trees
    for (let i = 0; i < 50; i++) {
      const tree = this.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 60,
        0,
        -40 + Math.random() * -20
      );
      tree.scale.setScalar(0.7 + Math.random() * 0.8);
      this.scene.add(tree);
    }

    // Add fog for atmosphere
    this.scene.fog = new THREE.Fog(0x1a4d1a, 10, 50);
  }

  /**
   * Create space environment
   */
  private createSpaceEnvironment(): void {
    this.scene.background = new THREE.Color(0x0a0a20);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);

    // Nebula effect
    const nebulaGeometry = new THREE.PlaneGeometry(100, 100);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x6b2d7b,
      transparent: true,
      opacity: 0.3
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.z = -50;
    this.scene.add(nebula);
  }

  /**
   * Create beach environment
   */
  private createBeachEnvironment(): void {
    // Sand
    const sandGeometry = new THREE.PlaneGeometry(100, 50);
    const sandMaterial = new THREE.MeshStandardMaterial({ color: 0xf5deb3 });
    const sand = new THREE.Mesh(sandGeometry, sandMaterial);
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -1;
    this.scene.add(sand);

    // Ocean
    const oceanGeometry = new THREE.PlaneGeometry(100, 50);
    const oceanMaterial = new THREE.MeshStandardMaterial({
      color: 0x00bcd4,
      transparent: true,
      opacity: 0.7
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -1;
    ocean.position.z = -25;
    this.scene.add(ocean);
  }

  /**
   * Create temple environment
   */
  private createTempleEnvironment(): void {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c4b0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Pillars
    for (let i = 0; i < 4; i++) {
      const pillar = this.createPillar();
      pillar.position.set(
        (i % 2 === 0 ? -8 : 8),
        0,
        (i < 2 ? -8 : 8)
      );
      this.scene.add(pillar);
    }

    // Central lotus
    const lotus = this.createLotus();
    lotus.position.y = 0.1;
    this.scene.add(lotus);
  }

  /**
   * Create pillar mesh
   */
  private createPillar(): THREE.Group {
    const group = new THREE.Group();

    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.y = 2.5;
    pillar.castShadow = true;
    group.add(pillar);

    // Capital
    const capitalGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    const capital = new THREE.Mesh(capitalGeometry, pillarMaterial);
    capital.position.y = 5;
    group.add(capital);

    return group;
  }

  /**
   * Create lotus mesh
   */
  private createLotus(): THREE.Group {
    const group = new THREE.Group();
    const petalCount = 8;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const petalMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        Math.cos(angle) * 0.5,
        0.2,
        Math.sin(angle) * 0.5
      );
      petal.scale.set(1, 0.3, 0.5);
      petal.rotation.z = angle;
      group.add(petal);
    }

    // Center
    const centerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.2;
    group.add(center);

    return group;
  }

  /**
   * Setup fog based on environment
   */
  private setupFog(): void {
    if (this.environment.weather === 'fog') {
      this.scene.fog = new THREE.FogExp2(0xcccccc, 0.05);
    } else if (this.environment.weather === 'rain') {
      this.scene.fog = new THREE.FogExp2(0x666666, 0.02);
    }
  }

  /**
   * Create emotion particles
   */
  createEmotionParticles(emotion: string, intensity: number): void {
    const particleCount = Math.floor(100 * intensity);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color = this.getEmotionColor(emotion);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    particles.name = 'emotionParticles';
    this.scene.add(particles);
    this.particleSystems.set('emotion', particles);
  }

  /**
   * Get color for emotion
   */
  private getEmotionColor(emotion: string): { r: number; g: number; b: number } {
    const emotionColors: Record<string, { r: number; g: number; b: number }> = {
      happy: { r: 1, g: 0.84, b: 0 },
      sad: { r: 0.3, g: 0.5, b: 0.8 },
      angry: { r: 1, g: 0.2, b: 0.2 },
      calm: { r: 0.4, g: 0.8, b: 0.6 },
      anxious: { r: 0.8, g: 0.4, b: 0.8 },
      energetic: { r: 1, g: 0.6, b: 0 },
      neutral: { r: 0.7, g: 0.7, b: 0.7 },
      grateful: { r: 1, g: 0.4, b: 0.6 },
      peaceful: { r: 0.5, g: 0.8, b: 1 }
    };

    return emotionColors[emotion] || emotionColors.neutral;
  }

  /**
   * Create mood aura
   */
  createMoodAura(mood: string, position: { x: number; y: number; z: number }): void {
    const color = this.getEmotionColor(mood);
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color.r, color.g, color.b),
      transparent: true,
      opacity: 0.3
    });

    const aura = new THREE.Mesh(geometry, material);
    aura.position.set(position.x, position.y, position.z);
    aura.name = 'moodAura';
    this.scene.add(aura);
    this.objects.set('moodAura', aura);
  }

  /**
   * Update scene for animation
   */
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    // Animate particles
    const emotionParticles = this.particleSystems.get('emotion');
    if (emotionParticles) {
      emotionParticles.rotation.y = time * 0.1;
      const positions = emotionParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + i) * 0.002;
      }
      emotionParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Animate mood aura
    const moodAura = this.objects.get('moodAura');
    if (moodAura) {
      moodAura.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update camera position
   */
  updateCameraPosition(position: { x: number; y: number; z: number }): void {
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Resize renderer
   */
  resize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Update environment
   */
  updateEnvironment(environment: AREnvironment): void {
    this.environment = environment;

    // Clear existing objects
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.setupLighting();
    this.setupEnvironment();
    this.setupFog();
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

// ============================================================================
// Pose Detection Service (using TensorFlow.js/PoseDetection)
// ============================================================================

export class PoseDetectionService {
  private detector: any = null;
  private isInitialized: boolean = false;
  private animationFrameId: number | null = null;

  /**
   * Initialize pose detector
   */
  async initialize(): Promise<boolean> {
    try {
      // Dynamic import of pose detection
      const poseDetection = await import('@tensorflow-models/pose-detection');

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        }
      );

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Pose detection initialization failed:', error);
      return false;
    }
  }

  /**
   * Detect poses from video element
   */
  async detectPoses(video: HTMLVideoElement): Promise<any[]> {
    if (!this.isInitialized || !this.detector) {
      return [];
    }

    try {
      const poses = await this.detector.estimatePoses(video);
      return poses;
    } catch (error) {
      console.error('Pose detection failed:', error);
      return [];
    }
  }

  /**
   * Calculate joint angles
   */
  calculateJointAngles(keypoints: any[]): Record<string, number> {
    const angles: Record<string, number> = {};

    // Helper function to calculate angle between three points
    const calculateAngle = (point1: any, point2: any, point3: any): number => {
      if (!point1 || !point2 || !point3) return 0;

      const radians = Math.atan2(
        point3.y - point2.y,
        point3.x - point2.x
      ) - Math.atan2(
        point1.y - point2.y,
        point1.x - point2.x
      );

      let angle = Math.abs(radians * 180.0 / Math.PI);
      if (angle > 180.0) {
        angle = 360 - angle;
      }

      return angle;
    };

    // Get keypoint maps for easier access
    const getKeypoint = (name: string) =>
      keypoints.find(kp => kp.name === name);

    // Calculate important angles
    angles.leftElbow = calculateAngle(
      getKeypoint('left_shoulder'),
      getKeypoint('left_elbow'),
      getKeypoint('left_wrist')
    );

    angles.rightElbow = calculateAngle(
      getKeypoint('right_shoulder'),
      getKeypoint('right_elbow'),
      getKeypoint('right_wrist')
    );

    angles.leftShoulder = calculateAngle(
      getKeypoint('left_elbow'),
      getKeypoint('left_shoulder'),
      getKeypoint('left_hip')
    );

    angles.rightShoulder = calculateAngle(
      getKeypoint('right_elbow'),
      getKeypoint('right_shoulder'),
      getKeypoint('right_hip')
    );

    angles.leftHip = calculateAngle(
      getKeypoint('left_shoulder'),
      getKeypoint('left_hip'),
      getKeypoint('left_knee')
    );

    angles.rightHip = calculateAngle(
      getKeypoint('right_shoulder'),
      getKeypoint('right_hip'),
      getKeypoint('right_knee')
    );

    angles.leftKnee = calculateAngle(
      getKeypoint('left_hip'),
      getKeypoint('left_knee'),
      getKeypoint('left_ankle')
    );

    angles.rightKnee = calculateAngle(
      getKeypoint('right_hip'),
      getKeypoint('right_knee'),
      getKeypoint('right_ankle')
    );

    // Spine angle
    angles.spine = calculateAngle(
      getKeypoint('left_shoulder'),
      getKeypoint('left_hip'),
      getKeypoint('left_knee')
    );

    return angles;
  }

  /**
   * Compare pose with target pose
   */
  compareWithTarget(
    detectedKeypoints: any[],
    targetPose: { name: string; category?: string }
  ): { accuracy: number; feedback: string[] } {
    const detectedAngles = this.calculateJointAngles(detectedKeypoints);
    const feedback: string[] = [];
    let totalAccuracy = 0;
    let comparisonCount = 0;

    // Define key angle comparisons for common yoga poses
    const comparisons: Record<string, { current: string; ideal: number; tolerance: number }> = {
      'Mountain Pose': {
        current: 'spine',
        ideal: 180,
        tolerance: 15
      },
      'Downward Dog': {
        current: 'leftHip',
        ideal: 90,
        tolerance: 20
      },
      'Tree Pose': {
        current: 'leftKnee',
        ideal: 45,
        tolerance: 15
      }
    };

    const comparison = comparisons[targetPose.name] || comparisons['Mountain Pose'];
    const currentAngle = detectedAngles[comparison.current] || 0;
    const difference = Math.abs(currentAngle - comparison.ideal);

    const accuracy = Math.max(0, 100 - (difference / comparison.tolerance) * 100);
    totalAccuracy += accuracy;
    comparisonCount++;

    // Generate feedback
    if (difference > comparison.tolerance) {
      if (currentAngle < comparison.ideal) {
        feedback.push(`Adjust your ${comparison.current}: bend more`);
      } else {
        feedback.push(`Adjust your ${comparison.current}: straighten more`);
      }
    } else {
      feedback.push(`Good ${comparison.current} alignment!`);
    }

    // Check symmetry
    const leftAccuracy = 100 - Math.abs(detectedAngles.leftShoulder - detectedAngles.rightShoulder);
    const rightAccuracy = 100 - Math.abs(detectedAngles.leftHip - detectedAngles.rightHip);

    if (leftAccuracy < 80) {
      feedback.push('Work on shoulder symmetry');
    }
    if (rightAccuracy < 80) {
      feedback.push('Work on hip symmetry');
    }

    return {
      accuracy: comparisonCount > 0 ? totalAccuracy / comparisonCount : 0,
      feedback
    };
  }

  /**
   * Check if detector is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Dispose detector
   */
  async dispose(): Promise<void> {
    if (this.detector) {
      await this.detector.dispose();
      this.detector = null;
      this.isInitialized = false;
    }
  }
}

// ============================================================================
// AR Session Recorder
// ============================================================================

export class ARSessionRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  /**
   * Start recording AR session
   */
  async startRecording(canvas: HTMLCanvasElement): Promise<boolean> {
    try {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(60);
      this.stream = stream;

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000);
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.chunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Capture frame
   */
  captureFrame(): ImageData | null {
    if (!this.canvas || !this.ctx) return null;
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}

// ============================================================================
// Export instances
// ============================================================================

export const spatialAudioSystem = new SpatialAudioSystem();
export const poseDetectionService = new PoseDetectionService();
export const arSessionRecorder = new ARSessionRecorder();
