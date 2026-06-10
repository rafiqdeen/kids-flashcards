import { Icon } from './Icon.jsx';

export function SpeakButton({ onSpeak, speaking, disabled, size = 'lg', label = 'Hear it again' }) {
  const dim = size === 'lg' ? 84 : 60;
  return (
    <button
      data-testid="speak-button"
      className={`pip-btn speak ${speaking ? 'is-playing' : ''}`}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onSpeak(); }}
      style={{ width: dim, height: dim }}
    >
      <span className="speak-waves" aria-hidden="true"><i></i><i></i><i></i></span>
      <Icon name={disabled ? 'mute' : 'sound'} size={size === 'lg' ? 36 : 26} />
    </button>
  );
}
