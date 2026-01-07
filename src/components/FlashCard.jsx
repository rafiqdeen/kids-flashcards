import { useState } from 'react';
import './FlashCard.css';

function FlashCard({ frontContent, backContent, onFlip, cardType = 'default', compact = false }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) {
      onFlip(!isFlipped);
    }
  };

  return (
    <div className={`flashcard-container ${cardType} ${compact ? 'compact' : ''}`} onClick={handleClick}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          {frontContent}
        </div>
        <div className="flashcard-back">
          {backContent}
        </div>
      </div>
      {!compact && <p className="flip-hint">Tap to flip!</p>}
    </div>
  );
}

export default FlashCard;
