// ============================================================================
// AR Integration Module for MoodMash
// WebXR-based augmented reality for wellness experiences
// ============================================================================

import { YogaPose, MeditationSession, MusicPlaylist } from './wellnessContent';

// ============================================================================
// WebXR Type Declarations (for browsers without native types)
// ============================================================================

declare global {
  interface Window {
    XR?: {
      isSessionSupported: (mode: string) => Promise<boolean>;
      requestSession: (mode: string, options?: object) => Promise<XRSession>;
    };
  }

  interface Navigator {
    xr?: {
      isSessionSupported: (mode: string) => Promise<boolean>;
      requestSession: (mode: string, options?: object) => Promise<XRSession>;
    };
  }

  interface XRSession extends EventTarget {
    end(): Promise<void>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    endSession?: () => void;
    updateRenderState?: (state: XRRenderStateInit) => void;
  }

  interface XRReferenceSpace extends EventTarget {}

  interface XRFrame {
    getViewerPose(referenceSpace: XRReferenceSpace): XRPose | null;
  }

  interface XRPose {
    transform: XRRigidTransform;
  }

  interface XRRigidTransform {
    position: { x: number; y: number; z: number };
    orientation: { x: number; y: number; z: number; w: number };
  }

  interface XRRenderStateInit {
    baseLayer?: XRWebGLLayer;
  }

  interface XRWebGLLayer {
    framebuffer: WebGLFramebuffer;
    framebufferWidth: number;
    framebufferHeight: number;
  }

  type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';
  type XRFrameRequestCallback = (time: number, frame: XRFrame) => void;
  type XRSessionInit = {
    requiredFeatures?: string[];
    optionalFeatures?: string[];
  };
}

// ============================================================================
// AR Types and Interfaces
// ============================================================================

export interface ARSessionConfig {
  type: ARSessionType;
  environment?: AREnvironment;
  enablePoseOverlay?: boolean;
  enableAudioGuide?: boolean;
  enableHapticFeedback?: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type ARSessionType = 'yoga' | 'meditation' | 'music' | 'breathing';

export interface AREnvironment {
  type: 'nature' | 'ocean' | 'mountain' | 'forest' | 'space' | 'minimal';
  timeOfDay: 'morning' | 'noon' | 'sunset' | 'night';
  weather: 'clear' | 'cloudy' | 'rain' | 'stars';
  customBackground?: string;
}

export interface ARPoseData {
  keypoints: PoseKeypoint[];
  confidence: number;
  skeleton: SkeletonBone[];
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface SkeletonBone {
  startPoint: string;
  endPoint: string;
  confidence: number;
}

export interface ARInstruction {
  id: string;
  type: 'visual' | 'audio' | 'haptic';
  message: string;
  duration?: number;
  timing?: 'immediate' | 'delayed' | 'repeat';
}

export interface ARMetrics {
  poseAccuracy: number;
  duration: number;
  calories?: number;
  heartRate?: number;
  mindfulnessScore?: number;
}

export interface XRDeviceInfo {
  isSupported: boolean;
  supportsAR: boolean;
  supportsVR: boolean;
  supportsHandTracking: boolean;
  maxLayerCount: number;
}

// ============================================================================
// WebXR Manager
// ============================================================================

export class WebXRManager {
  private xrSession: XRSession | null = null;
  private xrRefSpace: XRReferenceSpace | null = null;
  private isSupported: boolean = false;
  private onPoseUpdate: ((pose: ARPoseData) => void) | null = null;

  constructor() {
    this.checkSupport();
  }

  /**
   * Check WebXR support
   */
  async checkSupport(): Promise<XRDeviceInfo> {
    if (!navigator.xr) {
      return {
        isSupported: false,
        supportsAR: false,
        supportsVR: false,
        supportsHandTracking: false,
        maxLayerCount: 0,
      };
    }

    try {
      const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
      const isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');

      this.isSupported = isARSupported || isVRSupported;

      return {
        isSupported: this.isSupported,
        supportsAR: isARSupported,
        supportsVR: isVRSupported,
        supportsHandTracking: false, // Check if available
        maxLayerCount: 1,
      };
    } catch (error) {
      console.error('WebXR check failed:', error);
      return {
        isSupported: false,
        supportsAR: false,
        supportsVR: false,
        supportsHandTracking: false,
        maxLayerCount: 0,
      };
    }
  }

  /**
   * Start AR session
   */
  async startSession(config: ARSessionConfig): Promise<boolean> {
    if (!navigator.xr || !this.isSupported) {
      console.log('WebXR not supported, using fallback mode');
      return false;
    }

    try {
      const sessionInit: XRSessionInit = {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay', 'hand-tracking'],
      };

      this.xrSession = await navigator.xr.requestSession('immersive-ar', sessionInit);
      this.xrRefSpace = await this.xrSession.requestReferenceSpace('local-floor');

      // Set up render loop
      this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));

      return true;
    } catch (error) {
      console.error('Failed to start XR session:', error);
      return false;
    }
  }

  /**
   * End AR session
   */
  async endSession(): Promise<void> {
    if (this.xrSession) {
      await this.xrSession.end();
      this.xrSession = null;
      this.xrRefSpace = null;
    }
  }

  /**
   * XR frame callback
   */
  private onXRFrame(time: number, frame: XRFrame): void {
    if (!this.xrSession || !frame) return;

    this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));

    const pose = frame.getViewerPose(this.xrRefSpace!);
    if (pose && this.onPoseUpdate) {
      // Convert WebXR pose to our format
      const arPose = this.convertXRPose(pose);
      this.onPoseUpdate(arPose);
    }
  }

  /**
   * Convert WebXR pose to AR pose data
   */
  private convertXRPose(pose: XRPose): ARPoseData {
    const keypoints: PoseKeypoint[] = [];
    const transform = pose.transform;

    // Map common body keypoints
    const keypointNames = [
      'head', 'neck', 'leftShoulder', 'rightShoulder',
      'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
      'leftHip', 'rightHip', 'leftKnee', 'rightKnee',
      'leftAnkle', 'rightAnkle'
    ];

    keypointNames.forEach(name => {
      keypoints.push({
        name,
        x: transform.position.x,
        y: transform.position.y,
        z: transform.position.z,
        visibility: 1.0,
      });
    });

    return {
      keypoints,
      confidence: 0.9,
      skeleton: [],
    };
  }

  /**
   * Register pose update callback
   */
  onPoseDetection(callback: (pose: ARPoseData) => void): void {
    this.onPoseUpdate = callback;
  }

  /**
   * Get session status
   */
  getSessionStatus(): { isActive: boolean; isSupported: boolean } {
    return {
      isActive: this.xrSession !== null,
      isSupported: this.isSupported,
    };
  }
}

// ============================================================================
// Fallback AR Simulator (for devices without WebXR)
// ============================================================================

export class ARSimulator {
  private isActive: boolean = false;
  private animationFrame: number | null = null;
  private startTime: number = 0;
  private currentPoseIndex: number = 0;
  private poseSequence: string[] = [];
  private onProgress: ((progress: number, instruction: string) => void) | null = null;

  /**
   * Initialize simulator with pose sequence
   */
  initialize(poseSequence: string[]): void {
    this.poseSequence = poseSequence;
  }

  /**
   * Start simulation
   */
  start(
    onProgress: (progress: number, instruction: string) => void,
    onComplete: () => void
  ): void {
    this.isActive = true;
    this.startTime = Date.now();
    this.onProgress = onProgress;
    this.currentPoseIndex = 0;

    this.runSimulation(onComplete);
  }

  /**
   * Run simulation loop
   */
  private runSimulation(onComplete: () => void): void {
    if (!this.isActive) return;

    const elapsed = Date.now() - this.startTime;
    const cycleDuration = 60000; // 1 minute per pose cycle
    const totalDuration = cycleDuration * 3; // 3 cycles

    if (elapsed >= totalDuration) {
      this.isActive = false;
      onComplete();
      return;
    }

    const currentPose = this.poseSequence[this.currentPoseIndex];
    const progress = (elapsed % cycleDuration) / cycleDuration;

    if (this.onProgress) {
      this.onProgress(progress, currentPose);
    }

    // Move to next pose
    if (progress < 0.02) {
      this.currentPoseIndex = (this.currentPoseIndex + 1) % this.poseSequence.length;
    }

    this.animationFrame = requestAnimationFrame(() => this.runSimulation(onComplete));
  }

  /**
   * Stop simulation
   */
  stop(): void {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Get status
   */
  getStatus(): { isActive: boolean; currentPose: string; progress: number } {
    return {
      isActive: this.isActive,
      currentPose: this.poseSequence[this.currentPoseIndex] || '',
      progress: this.currentPoseIndex / this.poseSequence.length,
    };
  }
}

// ============================================================================
// 3D Environment Renderer (CSS-based)
// ============================================================================

export class EnvironmentRenderer {
  public isActive: boolean = false;
  private container: HTMLElement | null = null;
  private environment: AREnvironment;
  private animationId: number | null = null;

  constructor(environment: AREnvironment) {
    this.environment = environment;
  }

  /**
   * Mount renderer to container
   */
  mount(container: HTMLElement): void {
    this.container = container;
    this.render();
  }

  /**
   * Render environment
   */
  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.className = 'ar-environment';

    // Create environment layers
    const layers = this.createEnvironmentLayers();
    layers.forEach(layer => {
      const element = this.createLayerElement(layer);
      this.container!.appendChild(element);
    });

    // Start animations
    this.startAnimations();
  }

  /**
   * Create environment layers
   */
  private createEnvironmentLayers(): EnvironmentLayer[] {
    const layers: EnvironmentLayer[] = [];

    // Sky layer
    layers.push({
      type: 'sky',
      color: this.getSkyColor(),
      animation: 'gradient-shift',
      duration: 30000,
    });

    // Ground layer
    layers.push({
      type: 'ground',
      texture: this.getGroundTexture(),
      animation: 'subtle-shift',
      duration: 60000,
    });

    // Ambient elements
    if (this.environment.weather === 'stars' || this.environment.timeOfDay === 'night') {
      layers.push({
        type: 'stars',
        count: this.environment.weather === 'stars' ? 100 : 30,
        animation: 'twinkle',
        duration: 2000,
      });
    }

    if (this.environment.type === 'ocean') {
      layers.push({
        type: 'water',
        animation: 'wave-motion',
        duration: 4000,
      });
    }

    if (this.environment.type === 'forest' || this.environment.type === 'nature') {
      layers.push({
        type: 'trees',
        count: 5,
        animation: 'gentle-sway',
        duration: 5000,
      });
    }

    return layers;
  }

  /**
   * Get sky color based on time of day
   */
  private getSkyColor(): string {
    switch (this.environment.timeOfDay) {
      case 'morning': return 'linear-gradient(180deg, #ff9a9e 0%, #fecfef 50%, #a18cd1 100%)';
      case 'noon': return 'linear-gradient(180deg, #87ceeb 0%, #98d8c8 100%)';
      case 'sunset': return 'linear-gradient(180deg, #fdc830 0%, #f37335 50%, #8e2de2 100%)';
      case 'night': return 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
      default: return 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)';
    }
  }

  /**
   * Get ground texture
   */
  private getGroundTexture(): string {
    switch (this.environment.type) {
      case 'ocean': return 'ocean';
      case 'forest': return 'grass';
      case 'mountain': return 'stone';
      default: return 'neutral';
    }
  }

  /**
   * Create layer element
   */
  private createLayerElement(layer: EnvironmentLayer): HTMLElement {
    const element = document.createElement('div');
    element.className = `env-layer ${layer.type}`;
    element.style.cssText = this.getLayerStyles(layer);
    return element;
  }

  /**
   * Get CSS styles for layer
   */
  private getLayerStyles(layer: EnvironmentLayer): string {
    let styles = 'position: absolute; width: 100%; height: 100%;';

    switch (layer.type) {
      case 'sky':
        styles += `background: ${layer.color};`;
        break;
      case 'ground':
        styles += `
          bottom: 0;
          height: 40%;
          background: linear-gradient(180deg, #2d5016 0%, #1a3009 100%);
          transform: perspective(500px) rotateX(60deg);
          transform-origin: bottom;
        `;
        break;
      case 'stars':
        styles = this.createStarsStyle(layer.count || 50);
        break;
      case 'water':
        styles += `
          bottom: 0;
          height: 35%;
          background: linear-gradient(180deg, #0077b6 0%, #023e8a 100%);
          opacity: 0.8;
        `;
        break;
      case 'trees':
        styles = this.createTreesStyle(layer.count || 5);
        break;
    }

    return styles;
  }

  /**
   * Create stars style
   */
  private createStarsStyle(count: number): string {
    let styles = 'position: absolute; width: 100%; height: 100%; overflow: hidden;';
    let starsHtml = '';

    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 60;
      const size = Math.random() * 3 + 1;
      const delay = Math.random() * 5;

      starsHtml += `
        <div class="star" style="
          position: absolute;
          left: ${x}%;
          top: ${y}%;
          width: ${size}px;
          height: ${size}px;
          background: white;
          border-radius: 50%;
          animation: twinkle ${2 + Math.random() * 3}s infinite ${delay}s;
        "></div>
      `;
    }

    return styles + starsHtml;
  }

  /**
   * Create trees style
   */
  private createTreesStyle(count: number): string {
    let styles = 'position: absolute; bottom: 35%; width: 100%; height: 100%;';
    let treesHtml = '';

    for (let i = 0; i < count; i++) {
      const x = 10 + (i * 20) + Math.random() * 10;
      const height = 80 + Math.random() * 60;

      treesHtml += `
        <div class="tree" style="
          position: absolute;
          left: ${x}%;
          bottom: 0;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: ${height}px solid #1a4d1a;
          filter: blur(2px);
        "></div>
      `;
    }

    return styles + treesHtml;
  }

  /**
   * Start CSS animations
   */
  private startAnimations(): void {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
        @keyframes gradient-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(10deg); }
        }
        @keyframes wave-motion {
          0%, 100% { transform: translateY(0) skewX(0deg); }
          25% { transform: translateY(-5px) skewX(2deg); }
          75% { transform: translateY(5px) skewX(-2deg); }
        }
        @keyframes gentle-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        .ar-environment {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 16px;
        }
        .env-layer {
          transition: all 0.5s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Update environment
   */
  updateEnvironment(environment: AREnvironment): void {
    this.environment = environment;
    if (this.container) {
      this.render();
    }
  }

  /**
   * Unmount renderer
   */
  unmount(): void {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

interface EnvironmentLayer {
  type: string;
  color?: string;
  texture?: string;
  count?: number;
  animation: string;
  duration: number;
  customBackground?: string;
}

// ============================================================================
// AR Session Manager
// ============================================================================

export class ARSessionManager {
  private xrManager: WebXRManager;
  private simulator: ARSimulator;
  private renderer: EnvironmentRenderer | null = null;
  private config: ARSessionConfig | null = null;
  private isUsingSimulator: boolean = false;

  constructor() {
    this.xrManager = new WebXRManager();
    this.simulator = new ARSimulator();
  }

  /**
   * Initialize AR session
   */
  async initialize(config: ARSessionConfig): Promise<boolean> {
    this.config = config;

    // Try WebXR first
    const deviceInfo = await this.xrManager.checkSupport();

    if (deviceInfo.supportsAR && config.type !== 'meditation') {
      // Use WebXR for yoga pose detection
      const success = await this.xrManager.startSession(config);
      if (success) {
        this.isUsingSimulator = false;
        return true;
      }
    }

    // Fall back to simulator
    this.isUsingSimulator = true;
    console.log('Using AR simulator as fallback');
    return true;
  }

  /**
   * Mount to DOM element
   */
  mountToElement(element: HTMLElement, environment?: AREnvironment): void {
    const env = environment || this.config?.environment || {
      type: 'nature',
      timeOfDay: 'noon',
      weather: 'clear',
    };

    this.renderer = new EnvironmentRenderer(env);
    this.renderer.mount(element);
  }

  /**
   * Start yoga session
   */
  async startYogaSession(
    poses: YogaPose[],
    onProgress: (progress: number, instruction: string, metrics: ARMetrics) => void,
    onComplete: (metrics: ARMetrics) => void
  ): Promise<void> {
    const poseSequence = poses.map(p => p.name);

    if (this.isUsingSimulator) {
      this.simulator.initialize(poseSequence);

      this.simulator.start(
        (progress, currentPose) => {
          const metrics: ARMetrics = {
            poseAccuracy: 0.7 + Math.random() * 0.25,
            duration: Date.now(),
          };
          onProgress(progress, currentPose, metrics);
        },
        () => {
          const finalMetrics: ARMetrics = {
            poseAccuracy: 0.85,
            duration: Date.now(),
            calories: Math.round(poses.length * 15),
            mindfulnessScore: Math.round(70 + Math.random() * 25),
          };
          onComplete(finalMetrics);
        }
      );
    } else {
      // WebXR mode - would integrate with actual pose detection
      this.xrManager.onPoseDetection((pose) => {
        const metrics: ARMetrics = {
          poseAccuracy: pose.confidence,
          duration: Date.now(),
        };
        onProgress(0.5, 'Hold pose', metrics);
      });
    }
  }

  /**
   * Start meditation session
   */
  async startMeditationSession(
    session: MeditationSession,
    onPhaseChange: (phase: string, progress: number) => void,
    onComplete: () => void
  ): Promise<void> {
    const phases = ['preparation', 'breathing', 'main', 'cool-down'];
    const phaseDuration = (session.duration * 60) / phases.length;

    let currentPhaseIndex = 0;

    const runPhase = () => {
      if (currentPhaseIndex >= phases.length) {
        onComplete();
        return;
      }

      const phase = phases[currentPhaseIndex];
      let progress = 0;

      const interval = setInterval(() => {
        progress += 1;
        onPhaseChange(phase, progress);

        if (progress >= 100) {
          clearInterval(interval);
          currentPhaseIndex++;
          setTimeout(runPhase, 1000);
        }
      }, (phaseDuration * 1000) / 100);
    };

    runPhase();
  }

  /**
   * Get session status
   */
  getStatus(): { isActive: boolean; mode: 'xr' | 'simulator' } {
    const xrStatus = this.xrManager.getSessionStatus();
    return {
      isActive: xrStatus.isActive || this.simulator.getStatus().isActive,
      mode: this.isUsingSimulator ? 'simulator' : 'xr',
    };
  }

  /**
   * End session
   */
  async endSession(): Promise<void> {
    await this.xrManager.endSession();
    this.simulator.stop();
    if (this.renderer) {
      this.renderer.unmount();
      this.renderer = null;
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if AR is available
 */
export async function isARAvailable(): Promise<boolean> {
  if (!navigator.xr) return false;

  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
}

/**
 * Calculate pose accuracy
 */
export function calculatePoseAccuracy(
  detectedPose: ARPoseData,
  targetPose: YogaPose
): number {
  // Simplified accuracy calculation
  // In production, this would compare joint angles and positions
  return detectedPose.confidence * 0.9;
}

/**
 * Generate breathing guidance
 */
export function generateBreathingGuide(
  type: 'box' | '4-7-8' | '478' | 'coherent',
  onPhaseChange: (phase: string, duration: number) => void
): () => void {
  const patterns: Record<string, { inhale: number; hold: number; exhale: number; rest: number }> = {
    'box': { inhale: 4, hold: 4, exhale: 4, rest: 4 },
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, rest: 0 },
    '478': { inhale: 4, hold: 7, exhale: 8, rest: 0 },
    'coherent': { inhale: 5, hold: 0, exhale: 5, rest: 0 },
  };

  const pattern = patterns[type] || patterns['box'];
  let isRunning = true;

  const cycle = async () => {
    if (!isRunning) return;

    onPhaseChange('inhale', pattern.inhale);
    await sleep(pattern.inhale * 1000);
    if (!isRunning) return;

    if (pattern.hold > 0) {
      onPhaseChange('hold', pattern.hold);
      await sleep(pattern.hold * 1000);
      if (!isRunning) return;
    }

    onPhaseChange('exhale', pattern.exhale);
    await sleep(pattern.exhale * 1000);
    if (!isRunning) return;

    if (pattern.rest > 0) {
      onPhaseChange('rest', pattern.rest);
      await sleep(pattern.rest * 1000);
    }

    cycle();
  };

  cycle();

  return () => { isRunning = false; };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export singleton
export const arSessionManager = new ARSessionManager();
