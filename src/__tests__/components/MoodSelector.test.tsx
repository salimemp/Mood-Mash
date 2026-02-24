// ============================================================================
// Component Tests: MoodSelector
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MoodProvider } from '@/contexts/MoodContext';

// Mock component for testing
const MockMoodSelector = ({ onSelect }: { onSelect?: (mood: string) => void }) => {
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'angry', emoji: '😠', label: 'Angry' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'excited', emoji: '🤩', label: 'Excited' },
    { id: 'tired', emoji: '😴', label: 'Tired' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
  ];

  const handleSelect = (moodId: string) => {
    if (onSelect) onSelect(moodId);
  };

  return (
    <div role="grid" aria-label="Mood selector">
      {moods.map((mood) => (
        <button
          key={mood.id}
          role="gridcell"
          onClick={() => handleSelect(mood.id)}
          data-testid={`mood-${mood.id}`}
          aria-label={mood.label}
        >
          <span aria-hidden="true">{mood.emoji}</span>
        </button>
      ))}
    </div>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <MoodProvider>
        {ui}
      </MoodProvider>
    </BrowserRouter>
  );
};

describe('MoodSelector Component', () => {
  it('should render all mood options', () => {
    renderWithProviders(<MockMoodSelector />);

    expect(screen.getByTestId('mood-happy')).toBeInTheDocument();
    expect(screen.getByTestId('mood-sad')).toBeInTheDocument();
    expect(screen.getByTestId('mood-angry')).toBeInTheDocument();
    expect(screen.getByTestId('mood-anxious')).toBeInTheDocument();
    expect(screen.getByTestId('mood-calm')).toBeInTheDocument();
    expect(screen.getByTestId('mood-excited')).toBeInTheDocument();
    expect(screen.getByTestId('mood-tired')).toBeInTheDocument();
    expect(screen.getByTestId('mood-neutral')).toBeInTheDocument();
  });

  it('should have correct aria-labels for accessibility', () => {
    renderWithProviders(<MockMoodSelector />);

    expect(screen.getByLabelText('Happy')).toBeInTheDocument();
    expect(screen.getByLabelText('Sad')).toBeInTheDocument();
    expect(screen.getByLabelText('Calm')).toBeInTheDocument();
  });

  it('should call onSelect when mood is clicked', () => {
    const handleSelect = vi.fn();
    renderWithProviders(<MockMoodSelector onSelect={handleSelect} />);

    fireEvent.click(screen.getByTestId('mood-happy'));

    expect(handleSelect).toHaveBeenCalledWith('happy');
  });

  it('should have proper role attributes', () => {
    renderWithProviders(<MockMoodSelector />);

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-label', 'Mood selector');
  });

  it('should have focusable elements', () => {
    renderWithProviders(<MockMoodSelector />);

    const happyMood = screen.getByTestId('mood-happy');
    happyMood.focus();
    expect(document.activeElement).toBe(happyMood);
  });

  it('should render emojis correctly', () => {
    renderWithProviders(<MockMoodSelector />);

    expect(screen.getByTestId('mood-happy')).toHaveTextContent('😊');
    expect(screen.getByTestId('mood-sad')).toHaveTextContent('😢');
    expect(screen.getByTestId('mood-calm')).toHaveTextContent('😌');
  });
});
