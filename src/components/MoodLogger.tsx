import { useState, useRef, useEffect } from 'react';
import { useMood, MoodEmotion, MoodIntensity, PrivacyLevel, MOOD_EMOTIONS, INTENSITY_LABELS } from '../contexts/MoodContext';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import {
  Smile,
  Palette,
  BarChart,
  Mic,
  FileText,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Users,
  Globe,
  Square,
  Play,
} from 'lucide-react';

type InputMode = 'emoji' | 'color' | 'intensity' | 'text' | 'voice';

interface MoodLoggerProps {
  onClose?: () => void;
  onSave?: () => void;
}

export function MoodLogger({ onClose, onSave }: MoodLoggerProps) {
  const { addEntry, recentEmotions } = useMood();
  const [selectedEmotion, setSelectedEmotion] = useState<MoodEmotion | null>(null);
  const [intensity, setIntensity] = useState<MoodIntensity>(5);
  const [note, setNote] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyLevel>('global');
  const [inputMode, setInputMode] = useState<InputMode>('emoji');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  const {
    isRecording,
    isPaused,
    duration,
    audioUrl,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    transcribeAudio,
  } = useVoiceRecording({
    onRecordingComplete: async (blob, dur) => {
      console.log(`Recording complete: ${dur.toFixed(1)}s, ${blob.size} bytes`);
    },
    onError: (err) => {
      console.error('Recording error:', err);
    },
  });

  // Auto-transcribe when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleTranscribe();
    }
  }, [audioBlob, isRecording]);

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(audioBlob);
      setTranscribedText(text);
      setNote(text);
    } catch (err) {
      console.error('Transcription error:', err);
      setTranscribedText('Transcription unavailable. Note recording was saved.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleVoiceAction = () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearRecording();
      setTranscribedText('');
      startRecording();
    }
  };

  const handleSave = () => {
    if (!selectedEmotion) return;

    addEntry({
      emotion: selectedEmotion,
      intensity,
      note: note || undefined,
      privacy,
    });

    setSelectedEmotion(null);
    setIntensity(5);
    setNote('');
    setTranscribedText('');
    clearRecording();
    onSave?.();
    onClose?.();
  };

  const handleReset = () => {
    setSelectedEmotion(null);
    setIntensity(5);
    setNote('');
    setTranscribedText('');
    clearRecording();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const privacyIcons = {
    global: <Globe className="w-4 h-4" />,
    friends: <Users className="w-4 h-4" />,
    private: <Lock className="w-4 h-4" />,
  };

  return (
    <div className="glass rounded-3xl p-6 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Express Your Mood</h2>
        <p className="text-slate-400 text-sm">Tell us how you're feeling today</p>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex justify-center gap-1 mb-6 p-1 glass-light rounded-full">
        {[
          { mode: 'emoji' as InputMode, icon: Smile, label: 'Emoji' },
          { mode: 'color' as InputMode, icon: Palette, label: 'Color' },
          { mode: 'intensity' as InputMode, icon: BarChart, label: 'Intensity' },
          { mode: 'text' as InputMode, icon: FileText, label: 'Text' },
          { mode: 'voice' as InputMode, icon: Mic, label: 'Voice' },
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              inputMode === mode
                ? 'bg-violet-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="mb-6">
        {inputMode === 'emoji' && (
          <div>
            {/* Recent Emotions */}
            {recentEmotions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2 px-1">Recent</p>
                <div className="flex gap-2 flex-wrap">
                  {recentEmotions.slice(0, 5).map((emotion) => {
                    const mood = MOOD_EMOTIONS.find((m) => m.key === emotion);
                    return (
                      <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={`text-2xl w-10 h-10 rounded-xl transition-all ${
                          selectedEmotion === emotion
                            ? 'bg-violet-500/20 scale-110'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {mood?.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Emoji Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-2">
              {MOOD_EMOTIONS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => setSelectedEmotion(mood.key)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                    selectedEmotion === mood.key
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 scale-105 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {inputMode === 'color' && (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Pick a color that represents your mood</p>
            <div className="flex flex-wrap justify-center gap-3">
              {MOOD_EMOTIONS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => setSelectedEmotion(mood.key)}
                  className={`w-12 h-12 rounded-full transition-all ${
                    selectedEmotion === mood.key ? 'scale-125 ring-4 ring-white/30' : ''
                  }`}
                  style={{ backgroundColor: mood.color }}
                  title={mood.label}
                />
              ))}
            </div>
            {selectedEmotion && (
              <p className="text-white mt-4">
                {MOOD_EMOTIONS.find((m) => m.key === selectedEmotion)?.label}
              </p>
            )}
          </div>
        )}

        {inputMode === 'intensity' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm mb-2">How intense is this feeling?</p>
              {selectedEmotion && (
                <p className="text-white text-xl font-medium">
                  {MOOD_EMOTIONS.find((m) => m.key === selectedEmotion)?.emoji}{' '}
                  {MOOD_EMOTIONS.find((m) => m.key === selectedEmotion)?.label}
                </p>
              )}
            </div>

            {/* Intensity Slider */}
            <div className="px-4">
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value) as MoodIntensity)}
                className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-3">
                <span className="text-xs text-slate-500">Mild</span>
                <span className="text-xs text-white font-medium">{INTENSITY_LABELS[intensity]}</span>
                <span className="text-xs text-slate-500">Extreme</span>
              </div>
            </div>

            {/* Quick Select */}
            {!selectedEmotion && (
              <div className="mt-6">
                <p className="text-xs text-slate-500 mb-3 px-1">First select an emotion above</p>
                <div className="flex justify-center gap-2">
                  {[1, 3, 5, 7, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        if (!selectedEmotion) {
                          setSelectedEmotion('happy');
                        }
                        setIntensity(level as MoodIntensity);
                      }}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        intensity === level
                          ? 'bg-violet-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {inputMode === 'text' && (
          <div className="py-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write about how you're feeling..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            {selectedEmotion && (
              <p className="text-center text-sm text-slate-400 mt-2">
                Adding to: {MOOD_EMOTIONS.find((m) => m.key === selectedEmotion)?.emoji}{' '}
                {MOOD_EMOTIONS.find((m) => m.key === selectedEmotion)?.label}
              </p>
            )}
          </div>
        )}

        {inputMode === 'voice' && (
          <div className="py-4">
            {/* Recording Controls */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <button
                  onClick={handleVoiceAction}
                  className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 animate-pulse'
                      : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>

                {isRecording && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <span>{formatDuration(duration)}</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-slate-400 text-sm mt-8">
                {isRecording
                  ? 'Tap to stop recording'
                  : audioBlob
                  ? 'Recording complete!'
                  : 'Tap to record your mood'}
              </p>

              {/* Playback */}
              {audioUrl && !isRecording && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full max-w-xs h-10 rounded-lg"
                  />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Transcription */}
            {(isTranscribing || transcribedText || note) && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2 px-1">
                  {isTranscribing ? 'Transcribing...' : 'Transcription'}
                </p>
                <textarea
                  value={isTranscribing ? 'Transcribing...' : note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Your transcription will appear here..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none disabled:opacity-50"
                  disabled={isTranscribing}
                />
              </div>
            )}

            {/* Language Selection */}
            <div className="mt-4 text-center">
              <select className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="en-US">English (US)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="zh-CN">Chinese</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="mb-6">
        <button
          onClick={() => setShowPrivacySettings(!showPrivacySettings)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          {privacyIcons[privacy]}
          <span>
            {privacy === 'global' ? 'Global' : privacy === 'friends' ? 'Friends Only' : 'Private'}
          </span>
          <Sparkles className="w-4 h-4" />
        </button>

        {showPrivacySettings && (
          <div className="mt-3 p-3 glass-light rounded-xl">
            <p className="text-xs text-slate-500 mb-2">Who can see this entry?</p>
            <div className="flex gap-2">
              {[
                { key: 'global' as PrivacyLevel, icon: Globe, label: 'Global' },
                { key: 'friends' as PrivacyLevel, icon: Users, label: 'Friends' },
                { key: 'private' as PrivacyLevel, icon: Lock, label: 'Private' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setPrivacy(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
                    privacy === key
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-sm font-medium">Reset</span>
        </button>

        <button
          onClick={handleSave}
          disabled={!selectedEmotion}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            selectedEmotion
              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-violet-500/25'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Save Mood</span>
        </button>
      </div>
    </div>
  );
}

// Quick mood entry button for dashboard
export function QuickMoodEntry({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
        <Smile className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <p className="text-white font-medium group-hover:text-violet-300 transition-colors">How are you feeling?</p>
        <p className="text-slate-400 text-xs">Log your mood</p>
      </div>
      <Sparkles className="w-5 h-5 text-violet-400 ml-auto" />
    </button>
  );
}
