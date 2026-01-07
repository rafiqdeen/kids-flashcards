import { useState, useCallback } from 'react';
import FlashCard from './FlashCard';
import ProgressBar from './ProgressBar';
import './CardDeck.css';

function CardDeck({
  cards,
  category,
  renderFront,
  renderBack,
  onBack,
  onStartQuiz,
  progress,
  onCardViewed,
  onCardMastered,
  playSound
}) {
  const [confetti, setConfetti] = useState([]);
  const [celebratingCard, setCelebratingCard] = useState(null);

  const createConfetti = useCallback((x, y) => {
    const colors = ['#f43f5e', '#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
    const shapes = ['circle', 'square', 'triangle'];
    const newConfetti = [];

    for (let i = 0; i < 30; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 100,
        y: y,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1,
        angle: Math.random() * 360,
      });
    }

    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 3000);
  }, []);

  const handleFlip = (card, isFlipped) => {
    if (isFlipped) {
      playSound?.('flip');
      onCardViewed?.(card.id);
    }
  };

  const handleMastered = (card, event) => {
    const rect = event.target.getBoundingClientRect();
    createConfetti(rect.left + rect.width / 2, rect.top);
    setCelebratingCard(card.id);
    setTimeout(() => setCelebratingCard(null), 600);
    onCardMastered?.(card.id);
    playSound?.('success');
  };

  return (
    <div className="card-deck">
      {/* Confetti container */}
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="confetti active"
              style={{
                left: piece.x,
                top: piece.y,
                backgroundColor: piece.shape !== 'triangle' ? piece.color : 'transparent',
                borderRadius: piece.shape === 'circle' ? '50%' : '0',
                borderLeft: piece.shape === 'triangle' ? '5px solid transparent' : 'none',
                borderRight: piece.shape === 'triangle' ? '5px solid transparent' : 'none',
                borderBottom: piece.shape === 'triangle' ? `10px solid ${piece.color}` : 'none',
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                transform: `rotate(${piece.angle}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="deck-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="deck-title">{category}</h2>
        <button className="quiz-button" onClick={onStartQuiz}>
          Quiz Me!
        </button>
      </div>

      <ProgressBar
        total={cards.length}
        viewed={progress?.viewed?.length || 0}
        mastered={progress?.mastered?.length || 0}
      />

      <div className="cards-grid">
        {cards.map((card) => {
          const isMastered = progress?.mastered?.includes(card.id);
          const isCelebrating = celebratingCard === card.id;

          return (
            <div key={card.id} className={`card-grid-item ${isCelebrating ? 'celebrating' : ''}`}>
              <FlashCard
                frontContent={renderFront(card)}
                backContent={renderBack(card)}
                onFlip={(isFlipped) => handleFlip(card, isFlipped)}
                cardType={category.toLowerCase()}
                compact={true}
              />
              <button
                className={`card-mastered-btn ${isMastered ? 'is-mastered' : ''}`}
                onClick={(e) => handleMastered(card, e)}
                disabled={isMastered}
              >
                {isMastered ? '⭐ Learned!' : '✓ I Know This!'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardDeck;
