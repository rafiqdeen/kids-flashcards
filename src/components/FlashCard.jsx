import { useState, useImperativeHandle, forwardRef } from 'react';
import './FlashCard.css';

const FlashCard = forwardRef(function FlashCard({ frontContent, backContent, onFlip, cardType = 'default', compact = false, categoryColor }, ref) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Note: Flip state resets automatically when parent uses key={currentIndex} on wrapper
  // This causes React to remount the component when navigating between cards

  // Expose flip method to parent via ref
  useImperativeHandle(ref, () => ({
    flip: () => {
      const newFlipped = !isFlipped;
      setIsFlipped(newFlipped);
      if (onFlip) {
        onFlip(newFlipped);
      }
    },
    isFlipped: () => isFlipped
  }));

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) {
      onFlip(!isFlipped);
    }
  };

  return (
    <div
      className={`flashcard-container ${cardType} ${compact ? 'compact' : ''}`}
      onClick={handleClick}
      style={categoryColor ? { '--category-color': categoryColor } : undefined}
    >
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-front">
          {frontContent}
        </div>
        <div className="flashcard-back">
          {backContent}
        </div>
      </div>
      {!compact && (
        <p className="flip-hint">
          <svg className="flip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>Tap to flip!</span>
        </p>
      )}
    </div>
  );
});

export default FlashCard;
