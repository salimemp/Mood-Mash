// ============================================================================
// AR Mood Visualization Component
// 3D mood representations, emotion particles, mood journey visualization
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { X, Share2, Download, Play, Pause, ChevronLeft, ChevronRight, Sparkles, Heart, Sun, Cloud, Zap, Smile } from 'lucide-react';

interface ARMoodVisualizationProps {
  moodHistory: Array<{ date: Date; mood: string; intensity: number }>;
  currentMood?: string;
  onClose: () => void;
  onShare?: (blob: Blob) => void;
}

interface Mood3DSceneProps {
  mood: string;
  intensity: number;
  container: HTMLDivElement;
}

interface MoodJourneyPoint {
  date: Date;
  mood: string;
  intensity: number;
  position: { x: number; y: number; z: number };
}

// ============================================================================
// Three.js Mood Sphere Component
// ============================================================================

class MoodSphere3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sphere: THREE.Mesh;
  private particles: THREE.Points;
  private glow: THREE.Mesh;
  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private time: number = 0;

  constructor(container: HTMLElement, mood: string, intensity: number) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.createMoodSphere(mood, intensity);
    this.createEmotionParticles(mood, intensity);
    this.createGlow(mood, intensity);
    this.setupLighting();
    this.animate();
  }

  private createMoodSphere(mood: string, intensity: number): void {
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const color = this.getMoodColor(mood);
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      emissive: color,
      emissiveIntensity: intensity * 0.3
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
  }

  private createEmotionParticles(mood: string, intensity: number): void {
    const particleCount = Math.floor(500 * intensity);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = this.getMoodColor(mood);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.5 + Math.random() * 1.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      colors[i * 3] = color.r * (0.8 + Math.random() * 0.4);
      colors[i * 3 + 1] = color.g * (0.8 + Math.random() * 0.4);
      colors[i * 3 + 2] = color.b * (0.8 + Math.random() * 0.4);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private createGlow(mood: string, intensity: number): void {
    const geometry = new THREE.SphereGeometry(1.7, 32, 32);
    const color = this.getMoodColor(mood);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color.r, color.g, color.b) },
        intensity: { value: intensity * 0.5 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        void main() {
          float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, glow * intensity);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    this.glow = new THREE.Mesh(geometry, material);
    this.scene.add(this.glow);
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -5, 5);
    this.scene.add(pointLight);
  }

  private getMoodColor(mood: string): { r: number; g: number; b: number } {
    const moodColors: Record<string, { r: number; g: number; b: number }> = {
      happy: { r: 1, g: 0.85, b: 0 },
      joyful: { r: 1, g: 0.7, b: 0.2 },
      excited: { r: 1, g: 0.5, b: 0 },
      grateful: { r: 1, g: 0.4, b: 0.6 },
      peaceful: { r: 0.4, g: 0.8, b: 1 },
      calm: { r: 0.3, g: 0.8, b: 0.5 },
      neutral: { r: 0.7, g: 0.7, b: 0.7 },
      sad: { r: 0.3, g: 0.5, b: 0.8 },
      anxious: { r: 0.7, g: 0.3, b: 0.8 },
      stressed: { r: 0.9, g: 0.3, b: 0.3 },
      angry: { r: 1, g: 0.2, b: 0.2 },
      tired: { r: 0.5, g: 0.5, b: 0.7 },
      energetic: { r: 1, g: 0.8, b: 0.2 },
      motivated: { r: 1, g: 0.6, b: 0.2 }
    };

    return moodColors[mood.toLowerCase()] || moodColors.neutral;
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    // Rotate sphere
    this.sphere.rotation.y += 0.005;
    this.sphere.rotation.x += 0.002;

    // Animate particles
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(this.time + i) * 0.002;
      positions[i + 1] += Math.cos(this.time + i) * 0.002;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.y += 0.003;

    // Pulse glow
    const glowMaterial = this.glow.material as THREE.ShaderMaterial;
    glowMaterial.uniforms.intensity.value = 0.3 + Math.sin(this.time * 2) * 0.1;

    this.renderer.render(this.scene, this.camera);
  }

  public updateMood(mood: string, intensity: number): void {
    const color = this.getMoodColor(mood);

    const sphereMaterial = this.sphere.material as THREE.MeshPhysicalMaterial;
    sphereMaterial.color.setRGB(color.r, color.g, color.b);
    sphereMaterial.emissive.setRGB(color.r, color.g, color.b);
    sphereMaterial.emissiveIntensity = intensity * 0.3;

    const glowMaterial = this.glow.material as THREE.ShaderMaterial;
    glowMaterial.uniforms.glowColor.value.setRGB(color.r, color.g, color.b);
    glowMaterial.uniforms.intensity.value = intensity * 0.5;

    // Update particles
    this.scene.remove(this.particles);
    this.createEmotionParticles(mood, intensity);
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
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
    this.container.removeChild(this.renderer.domElement);
  }
}

// ============================================================================
// Mood Journey 3D Path Component
// ============================================================================

class MoodJourney3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private currentPointIndex: number = 0;
  private pathLine: THREE.Line | null = null;
  private pointMeshes: THREE.Mesh[] = [];
  private journeyPoints: MoodJourneyPoint[] = [];
  private onPointChange?: (point: MoodJourneyPoint) => void;

  constructor(container: HTMLElement, journeyPoints: MoodJourneyPoint[], onPointChange?: (point: MoodJourneyPoint) => void) {
    this.container = container;
    this.journeyPoints = journeyPoints;
    this.onPointChange = onPointChange;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 15;
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.createJourneyPath();
    this.createJourneyPoints();
    this.setupLighting();
    this.animate();
  }

  private createJourneyPath(): void {
    if (this.journeyPoints.length < 2) return;

    const points = this.journeyPoints.map(p =>
      new THREE.Vector3(p.position.x, p.position.y, p.position.z)
    );

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      linewidth: 2
    });

    this.pathLine = new THREE.Line(geometry, material);
    this.scene.add(this.pathLine);
  }

  private createJourneyPoints(): void {
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);

    this.journeyPoints.forEach((point, index) => {
      const color = this.getMoodColor(point.mood);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color.r, color.g, color.b),
        emissive: new THREE.Color(color.r * 0.3, color.g * 0.3, color.b * 0.3)
      });

      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.set(point.position.x, point.position.y, point.position.z);
      mesh.userData = { index, point };
      this.scene.add(mesh);
      this.pointMeshes.push(mesh);

      // Add date label
      this.addDateLabel(point, mesh.position);
    });
  }

  private addDateLabel(point: MoodJourneyPoint, position: THREE.Vector3): void {
    // In a full implementation, we would use TextGeometry or HTML overlays
    // For now, we'll use a simple sprite approach
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 128;
    canvas.height = 64;
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.roundRect(0, 0, 128, 64, 8);
    context.fill();

    context.font = '14px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(point.date.toLocaleDateString(), 64, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.y += 1;
    sprite.scale.set(2, 1, 1);
    this.scene.add(sprite);
  }

  private getMoodColor(mood: string): { r: number; g: number; b: number } {
    const moodColors: Record<string, { r: number; g: number; b: number }> = {
      happy: { r: 1, g: 0.85, b: 0 },
      sad: { r: 0.3, g: 0.5, b: 0.8 },
      anxious: { r: 0.7, g: 0.3, b: 0.8 },
      calm: { r: 0.3, g: 0.8, b: 0.5 },
      energetic: { r: 1, g: 0.8, b: 0.2 },
      neutral: { r: 0.7, g: 0.7, b: 0.7 }
    };

    return moodColors[mood.toLowerCase()] || moodColors.neutral;
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Subtle camera movement
    const time = Date.now() * 0.0001;
    this.camera.position.x = Math.sin(time) * 5;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  public navigateToPoint(index: number): void {
    if (index < 0 || index >= this.pointMeshes.length) return;

    this.currentPointIndex = index;
    const mesh = this.pointMeshes[index];
    const point = this.journeyPoints[index];

    // Highlight current point
    this.pointMeshes.forEach((m, i) => {
      const material = m.material as THREE.MeshPhongMaterial;
      if (i === index) {
        material.emissiveIntensity = 0.8;
        material.scale.setScalar(1.5);
      } else {
        material.emissiveIntensity = 0.3;
        material.scale.setScalar(1);
      }
    });

    // Move camera to point
    this.camera.position.set(
      mesh.position.x + 3,
      mesh.position.y + 2,
      mesh.position.z + 3
    );
    this.camera.lookAt(mesh.position);

    this.onPointChange?.(point);
  }

  public nextPoint(): void {
    this.navigateToPoint(Math.min(this.currentPointIndex + 1, this.pointMeshes.length - 1));
  }

  public previousPoint(): void {
    this.navigateToPoint(Math.max(this.currentPointIndex - 1, 0));
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
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
    this.container.removeChild(this.renderer.domElement);
  }
}

// ============================================================================
// Main AR Mood Visualization Component
// ============================================================================

export function ARMoodVisualization({ moodHistory, currentMood, onClose, onShare }: ARMoodVisualizationProps) {
  const sphereContainerRef = useRef<HTMLDivElement>(null);
  const journeyContainerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'sphere' | 'journey'>('sphere');
  const [selectedMood, setSelectedMood] = useState(currentMood || 'happy');
  const [intensity, setIntensity] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedJourneyPoint, setSelectedJourneyPoint] = useState<MoodJourneyPoint | null>(null);

  const sphereRef = useRef<MoodSphere3D | null>(null);
  const journeyRef = useRef<MoodJourney3D | null>(null);

  // Initialize 3D sphere
  useEffect(() => {
    if (!sphereContainerRef.current || viewMode !== 'sphere') return;

    sphereRef.current = new MoodSphere3D(sphereContainerRef.current, selectedMood, intensity);

    const handleResize = () => sphereRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      sphereRef.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode]);

  // Initialize journey view
  useEffect(() => {
    if (!journeyContainerRef.current || viewMode !== 'journey' || moodHistory.length === 0) return;

    const journeyPoints: MoodJourneyPoint[] = moodHistory.map((entry, index) => ({
      date: entry.date,
      mood: entry.mood,
      intensity: entry.intensity,
      position: {
        x: (index - moodHistory.length / 2) * 2,
        y: Math.sin(index * 0.5) * 2,
        z: Math.cos(index * 0.3) * 1
      }
    }));

    journeyRef.current = new MoodJourney3D(journeyContainerRef.current, journeyPoints, (point) => {
      setSelectedJourneyPoint(point);
      setSelectedMood(point.mood);
      setIntensity(point.intensity);
    });

    const handleResize = () => journeyRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      journeyRef.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode, moodHistory]);

  // Update sphere when mood changes
  useEffect(() => {
    if (sphereRef.current) {
      sphereRef.current.updateMood(selectedMood, intensity);
    }
  }, [selectedMood, intensity]);

  // Mood emoji mapping
  const getMoodEmoji = (mood: string): string => {
    const emojis: Record<string, string> = {
      happy: '😊', joyful: '😄', excited: '🤩', grateful: '🙏',
      peaceful: '😌', calm: '😌', neutral: '😐', sad: '😢',
      anxious: '😰', stressed: '😣', angry: '😠', tired: '😴',
      energetic: '⚡', motivated: '💪'
    };
    return emojis[mood.toLowerCase()] || '😐';
  };

  // Mood description
  const getMoodDescription = (mood: string): string => {
    const descriptions: Record<string, string> = {
      happy: 'Feeling joyful and content',
      joyful: 'Full of happiness and delight',
      excited: 'Enthusiastic and energized',
      grateful: 'Appreciating life\'s blessings',
      peaceful: 'Serene and at ease',
      calm: 'Quiet and undisturbed',
      neutral: 'Balanced and steady',
      sad: 'Feeling down or melancholic',
      anxious: 'Worried and uneasy',
      stressed: 'Under pressure',
      angry: 'Feeling frustrated',
      tired: 'Low on energy',
      energetic: 'Full of vitality',
      motivated: 'Driven and purposeful'
    };
    return descriptions[mood.toLowerCase()] || 'Mood state';
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AR Mood Visualization</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('sphere')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'sphere' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              Mood Sphere
            </button>
            <button
              onClick={() => setViewMode('journey')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'journey' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              Mood Journey
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <div
            ref={sphereContainerRef}
            className={`absolute inset-0 ${viewMode === 'sphere' ? 'block' : 'hidden'}`}
          />

          <div
            ref={journeyContainerRef}
            className={`absolute inset-0 ${viewMode === 'journey' ? 'block' : 'hidden'}`}
          />

          {/* Journey Navigation */}
          {viewMode === 'journey' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={() => journeyRef.current?.previousPoint()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => journeyRef.current?.nextPoint()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Mood Controls Panel */}
        <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto">
          {/* Current Mood Display */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">{getMoodEmoji(selectedMood)}</div>
            <h3 className="text-lg font-semibold text-white capitalize">{selectedMood}</h3>
            <p className="text-sm text-white/60">{getMoodDescription(selectedMood)}</p>
          </div>

          {/* Mood Selection Grid */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white/70 mb-3">Select Mood</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mood: 'happy', icon: '😊' },
                { mood: 'calm', icon: '😌' },
                { mood: 'energetic', icon: '⚡' },
                { mood: 'grateful', icon: '🙏' },
                { mood: 'sad', icon: '😢' },
                { mood: 'anxious', icon: '😰' },
                { mood: 'neutral', icon: '😐' },
                { mood: 'tired', icon: '😴' }
              ].map(({ mood, icon }) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-3 rounded-xl text-2xl transition-all ${
                    selectedMood === mood
                      ? 'bg-purple-500/30 ring-2 ring-purple-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  title={mood}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Intensity</span>
              <span className="text-white">{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Journey Point Details */}
          {selectedJourneyPoint && viewMode === 'journey' && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <h4 className="text-sm font-medium text-white/70 mb-2">Selected Date</h4>
              <p className="text-white font-medium">
                {selectedJourneyPoint.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{getMoodEmoji(selectedJourneyPoint.mood)}</span>
                <span className="text-white capitalize">{selectedJourneyPoint.mood}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors">
              <Share2 className="w-4 h-4" />
              Share Visualization
            </button>

            <button className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
              <Download className="w-4 h-4" />
              Save as Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ARMoodVisualization;
