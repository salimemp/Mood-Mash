// ============================================================================
// AR Social Space Component
// Virtual support groups, AR avatars, shared AR spaces, mood sharing
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  Users, Mic, MicOff, Video, VideoOff, MessageCircle,
  Share2, Settings, X, User, Volume2, Smile, Sparkles,
  Send, Crown, Heart, Zap, Plus, LogOut
} from 'lucide-react';

interface ARSocialSpaceProps {
  sessionId?: string;
  roomCode?: string;
  onClose: () => void;
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  mood?: string;
  position: { x: number; y: number; z: number };
  isSpeaking: boolean;
  isMuted: boolean;
  hasVideo: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  mood?: string;
}

interface VirtualRoom {
  id: string;
  name: string;
  type: 'support' | 'meditation' | 'yoga' | 'chat';
  participants: Participant[];
  maxParticipants: number;
  isPrivate: boolean;
  hostId: string;
}

// ============================================================================
// 3D Avatar Component
// ============================================================================

class Avatar3DManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private avatars: Map<string, THREE.Group> = new Map();
  private clock: THREE.Clock;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.setupEnvironment();
    this.setupLighting();
    this.animate();
  }

  private setupEnvironment(): void {
    // Floor
    const floorGeometry = new THREE.CircleGeometry(10, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Glowing circle for meeting area
    const ringGeometry = new THREE.RingGeometry(4, 4.2, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);

    // Add floating particles for atmosphere
    this.createAmbientParticles();
  }

  private createAmbientParticles(): void {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 5 + 1;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x8b5cf6, 0.5, 20);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);
  }

  /**
   * Create or update avatar
   */
  createAvatar(participant: Participant): void {
    const existingAvatar = this.avatars.get(participant.id);
    if (existingAvatar) {
      this.updateAvatarPosition(participant.id, participant.position);
      this.updateAvatarState(participant.id, participant.isSpeaking, participant.mood);
      return;
    }

    const avatar = this.createAvatarMesh(participant);
    avatar.position.set(participant.position.x, participant.position.y, participant.position.z);
    this.scene.add(avatar);
    this.avatars.set(participant.id, avatar);
  }

  private createAvatarMesh(participant: Participant): THREE.Group {
    const group = new THREE.Group();

    // Get mood color for avatar glow
    const moodColor = this.getMoodColor(participant.mood);

    // Body (torso)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: moodColor,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd699,
      roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 1.85, 0.28);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 1.85, 0.28);
    group.add(rightEye);

    // Name tag background
    const nameTagGeometry = new THREE.PlaneGeometry(1.2, 0.4);
    const nameTagMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.8
    });
    const nameTag = new THREE.Mesh(nameTagGeometry, nameTagMaterial);
    nameTag.position.y = 2.5;
    group.add(nameTag);

    // Speaking indicator ring
    if (participant.isSpeaking) {
      const ringGeometry = new THREE.TorusGeometry(0.6, 0.02, 8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.8
      });
      const speakingRing = new THREE.Mesh(ringGeometry, ringMaterial);
      speakingRing.rotation.x = Math.PI / 2;
      speakingRing.position.y = 1;
      speakingRing.name = 'speakingIndicator';
      group.add(speakingRing);
    }

    // Mood glow
    if (participant.mood) {
      const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: moodColor,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.y = 1.5;
      glow.name = 'moodGlow';
      group.add(glow);
    }

    // Muted indicator
    if (participant.isMuted) {
      const mutedGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
      const mutedMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const mutedCone = new THREE.Mesh(mutedGeometry, mutedMaterial);
      mutedCone.position.set(0.5, 2, 0);
      mutedCone.rotation.z = -Math.PI / 4;
      group.add(mutedCone);
    }

    return group;
  }

  private getMoodColor(mood?: string): number {
    const moodColors: Record<string, number> = {
      happy: 0xffd700,
      calm: 0x22c55e,
      energetic: 0xf97316,
      grateful: 0xec4899,
      peaceful: 0x06b6d4,
      neutral: 0x6b7280,
      sad: 0x3b82f6,
      anxious: 0xa855f7,
      stressed: 0xef4444,
      tired: 0x64748b
    };

    return mood ? moodColors[mood.toLowerCase()] || 0x8b5cf6 : 0x8b5cf6;
  }

  /**
   * Update avatar position
   */
  updateAvatarPosition(id: string, position: { x: number; y: number; z: number }): void {
    const avatar = this.avatars.get(id);
    if (avatar) {
      // Smooth interpolation
      const targetPosition = new THREE.Vector3(position.x, position.y, position.z);
      avatar.position.lerp(targetPosition, 0.1);
    }
  }

  /**
   * Update avatar state (speaking, mood)
   */
  updateAvatarState(id: string, isSpeaking: boolean, mood?: string): void {
    const avatar = this.avatars.get(id);
    if (!avatar) return;

    // Update speaking indicator
    const speakingIndicator = avatar.getObjectByName('speakingIndicator') as THREE.Mesh;
    if (speakingIndicator) {
      if (isSpeaking) {
        speakingIndicator.visible = true;
        speakingIndicator.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2);
      } else {
        speakingIndicator.visible = false;
      }
    }

    // Update mood glow
    const moodGlow = avatar.getObjectByName('moodGlow') as THREE.Mesh;
    if (moodGlow && mood) {
      const color = this.getMoodColor(mood);
      (moodGlow.material as THREE.MeshBasicMaterial).color.setHex(color);
    }
  }

  /**
   * Remove avatar
   */
  removeAvatar(id: string): void {
    const avatar = this.avatars.get(id);
    if (avatar) {
      this.scene.remove(avatar);
      this.avatars.delete(id);
    }
  }

  /**
   * Set camera to follow participant
   */
  focusOnParticipant(id: string): void {
    const avatar = this.avatars.get(id);
    if (avatar) {
      const targetPosition = avatar.position.clone();
      this.camera.position.set(
        targetPosition.x + 3,
        targetPosition.y + 2,
        targetPosition.z + 5
      );
      this.camera.lookAt(targetPosition);
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Animate speaking indicators
    this.avatars.forEach((avatar) => {
      const speakingIndicator = avatar.getObjectByName('speakingIndicator') as THREE.Mesh;
      if (speakingIndicator && speakingIndicator.visible) {
        speakingIndicator.rotation.z += 0.02;
        speakingIndicator.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
      }
    });

    // Gentle camera sway
    const time = this.clock.getElapsedTime();
    this.camera.position.x = Math.sin(time * 0.1) * 0.5;

    this.renderer.render(this.scene, this.camera);
  }

  resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.avatars.forEach((avatar) => {
      avatar.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    });

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// ============================================================================
// Main AR Social Space Component
// ============================================================================

export function ARSocialSpace({ sessionId, roomCode, onClose, userId, userName, userAvatar }: ARSocialSpaceProps) {
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const avatarManagerRef = useRef<Avatar3DManager | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<VirtualRoom | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Mock available rooms
  const availableRooms: VirtualRoom[] = [
    {
      id: 'room1',
      name: 'Morning Gratitude Circle',
      type: 'support',
      participants: [],
      maxParticipants: 10,
      isPrivate: false,
      hostId: 'host1'
    },
    {
      id: 'room2',
      name: 'Guided Meditation Together',
      type: 'meditation',
      participants: [],
      maxParticipants: 8,
      isPrivate: false,
      hostId: 'host2'
    },
    {
      id: 'room3',
      name: 'Yoga Flow Session',
      type: 'yoga',
      participants: [],
      maxParticipants: 6,
      isPrivate: false,
      hostId: 'host3'
    }
  ];

  // Initialize 3D scene
  useEffect(() => {
    if (!sceneContainerRef.current) return;

    avatarManagerRef.current = new Avatar3DManager(sceneContainerRef.current);

    const handleResize = () => avatarManagerRef.current?.resize();
    window.addEventListener('resize', handleResize);

    // Add self as participant
    const selfParticipant: Participant = {
      id: userId,
      name: userName,
      mood: 'calm',
      position: { x: 0, y: 0, z: 3 },
      isSpeaking: false,
      isMuted: false,
      hasVideo: true
    };

    setParticipants([selfParticipant]);

    // Add some mock participants for demo
    setTimeout(() => {
      const mockParticipants: Participant[] = [
        {
          id: 'user2',
          name: 'Sarah',
          mood: 'peaceful',
          position: { x: -2, y: 0, z: 1 },
          isSpeaking: false,
          isMuted: false,
          hasVideo: true
        },
        {
          id: 'user3',
          name: 'Michael',
          mood: 'grateful',
          position: { x: 2, y: 0, z: 1 },
          isSpeaking: true,
          isMuted: false,
          hasVideo: true
        },
        {
          id: 'user4',
          name: 'Emma',
          mood: 'happy',
          position: { x: 0, y: 0, z: -1 },
          isSpeaking: false,
          isMuted: true,
          hasVideo: false
        }
      ];

      setParticipants(prev => [...prev, ...mockParticipants]);
    }, 2000);

    return () => {
      avatarManagerRef.current?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [userId, userName]);

  // Update avatars in 3D scene
  useEffect(() => {
    if (!avatarManagerRef.current) return;

    participants.forEach(participant => {
      avatarManagerRef.current?.createAvatar(participant);
    });
  }, [participants]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      message: currentMessage,
      timestamp: new Date(),
      mood: participants.find(p => p.id === userId)?.mood
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
  }, [currentMessage, userId, userName, participants]);

  // Get room icon
  const getRoomIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'support': return <Heart className="w-4 h-4 text-pink-400" />;
      case 'meditation': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'yoga': return <Zap className="w-4 h-4 text-purple-400" />;
      default: return <Users className="w-4 h-4 text-blue-400" />;
    }
  };

  // Get mood emoji
  const getMoodEmoji = (mood?: string): string => {
    const emojis: Record<string, string> = {
      happy: '😊', calm: '😌', energetic: '⚡', grateful: '🙏',
      peaceful: '😌', neutral: '😐', sad: '😢', anxious: '😰',
      stressed: '😣', tired: '😴'
    };
    return mood ? emojis[mood.toLowerCase()] || '😐' : '😐';
  };

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AR Social Space</h2>
          {selectedRoom && (
            <span className="px-2 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm">
              {selectedRoom.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-full transition-colors ${
              showChat ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Toggle Participants */}
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-2 rounded-full transition-colors ${
              showParticipants ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <div ref={sceneContainerRef} className="absolute inset-0" />

          {/* Room Selection Overlay */}
          {!selectedRoom && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Join a Space
                </h3>

                <div className="space-y-3">
                  {availableRooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {getRoomIcon(room.type)}
                        <div>
                          <h4 className="text-white font-medium">{room.name}</h4>
                          <p className="text-white/50 text-sm">
                            {room.participants.length + 1}/{room.maxParticipants} participants
                          </p>
                        </div>
                      </div>
                      <span className="text-white/30">
                        {room.isPrivate ? '🔒' : '🌐'}
                      </span>
                    </button>
                  ))}
                </div>

                <button className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                  Create New Space
                </button>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* Mute/Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Video On/Off */}
            <button
              onClick={() => setHasVideo(!hasVideo)}
              className={`p-4 rounded-full transition-colors ${
                !hasVideo ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {hasVideo ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {/* Leave Room */}
            <button
              onClick={() => {
                setSelectedRoom(null);
                setParticipants([participants[0]]);
              }}
              className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && selectedRoom && (
          <div className="w-64 bg-black/40 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </h3>

            <div className="space-y-2">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                    {participant.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">
                        {participant.name}
                      </span>
                      {participant.id === selectedRoom.hostId && (
                        <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      )}
                      {participant.id === userId && (
                        <span className="text-xs text-white/40">(you)</span>
                      )}
                    </div>
                    {participant.mood && (
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        {getMoodEmoji(participant.mood)} {participant.mood}
                      </span>
                    )}
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-1">
                    {participant.isSpeaking && (
                      <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />
                    )}
                    {participant.isMuted && (
                      <MicOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-white/40 text-sm py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.userId === userId ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {message.userName.charAt(0)}
                    </div>
                    <div className={`max-w-[70%] ${
                      message.userId === userId ? 'text-right' : ''
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white/50">{message.userName}</span>
                        {message.mood && (
                          <span className="text-xs">{getMoodEmoji(message.mood)}</span>
                        )}
                        <span className="text-xs text-white/30">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className={`p-2 rounded-xl text-sm ${
                        message.userId === userId
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}>
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Quick mood share */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-white/50">Share your mood:</span>
                <div className="flex gap-1">
                  {['happy', 'calm', 'grateful', 'peaceful'].map(mood => (
                    <button
                      key={mood}
                      onClick={() => setCurrentMessage(`I'm feeling ${mood} today!`)}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-colors"
                      title={mood}
                    >
                      {getMoodEmoji(mood)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ARSocialSpace;
