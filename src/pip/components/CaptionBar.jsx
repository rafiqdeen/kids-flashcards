import { Icon } from './Icon.jsx';
import { useCaption } from '../speech.js';

export function CaptionBar() {
  const cap = useCaption();
  if (!cap) return null;
  return (
    <div className="pip-caption" role="status" aria-live="polite">
      <Icon name="sound" size={18} />
      {cap}
    </div>
  );
}
