import { useState, useCallback } from 'react';
import FlashCard from './FlashCard';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confetti, setConfetti] = useState([]);
  const [direction, setDirection] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [starBurst, setStarBurst] = useState(false);

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

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection('next');
      setCurrentIndex(currentIndex + 1);
      playSound?.('click');
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection('prev');
      setCurrentIndex(currentIndex - 1);
      playSound?.('click');
    }
  };

  const goToCard = (index) => {
    if (index !== currentIndex && index >= 0 && index < cards.length) {
      setDirection(index > currentIndex ? 'next' : 'prev');
      setCurrentIndex(index);
      playSound?.('click');
    }
  };

  const handleFlip = (card, isFlipped) => {
    if (isFlipped) {
      playSound?.('flip');
      onCardViewed?.(card.id);
    }
  };

  const handleMastered = (card, event) => {
    const rect = event.target.getBoundingClientRect();
    createConfetti(rect.left + rect.width / 2, rect.top);

    // Star burst animation
    setStarBurst(true);
    setTimeout(() => setStarBurst(false), 600);

    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);

    // Check for streak milestones
    if (newStreak > 0 && newStreak % 3 === 0) {
      setShowStreakCelebration(true);
      setTimeout(() => setShowStreakCelebration(false), 2000);
    }

    onCardMastered?.(card.id);
    playSound?.('success');
  };

  const currentCard = cards[currentIndex];
  const isMastered = progress?.mastered?.includes(currentCard?.id);
  const masteredCount = progress?.mastered?.length || 0;

  // Handle touch/swipe
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  };

  // Get visible thumbnails (show 7 centered around current)
  const getVisibleThumbnails = () => {
    const visible = [];
    const range = 3; // Show 3 on each side
    for (let i = currentIndex - range; i <= currentIndex + range; i++) {
      if (i >= 0 && i < cards.length) {
        visible.push({ index: i, card: cards[i] });
      }
    }
    return visible;
  };

  return (
    <div
      className="single-card-view"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Confetti */}
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

      {/* Streak Celebration */}
      {showStreakCelebration && (
        <div className="streak-celebration">
          <span className="streak-number">{streak}</span>
          <span className="streak-text">in a row!</span>
        </div>
      )}

      {/* Header */}
      <header className="single-card-header">
        <button className="header-btn back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="header-info">
          <h1 className="header-title">{category}</h1>
          <div className="header-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(masteredCount / cards.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">{masteredCount}/{cards.length} learned</span>
          </div>
        </div>

        <button className="header-btn quiz-btn" onClick={onStartQuiz}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      {/* Streak Counter */}
      {streak > 0 && (
        <div className={`streak-counter ${streak >= 5 ? 'hot' : ''} ${streak >= 10 ? 'fire' : ''}`}>
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak}</span>
        </div>
      )}

      {/* Main Card Area */}
      <main
        className="card-area"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cards Display with Side Previews */}
        <div className="cards-display">
          {/* Previous Card Preview */}
          {currentIndex > 0 && (
            <div className="side-card side-card-prev" onClick={goPrev}>
              <div className="side-card-content">
                <span className="side-card-label">
                  {cards[currentIndex - 1].letter || cards[currentIndex - 1].number || cards[currentIndex - 1].emoji}
                </span>
              </div>
            </div>
          )}

          {/* Navigation - Previous */}
          <button
            className={`nav-arrow nav-prev ${currentIndex === 0 ? 'hidden' : ''}`}
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Main Card Container */}
          <div className="card-container">
            <div className={`card-wrapper ${direction ? `slide-${direction}` : ''}`} key={currentIndex}>
              <FlashCard
                frontContent={renderFront(currentCard)}
                backContent={renderBack(currentCard)}
                onFlip={(isFlipped) => handleFlip(currentCard, isFlipped)}
                cardType={category.toLowerCase()}
              />
            </div>
          </div>

          {/* Navigation - Next */}
          <button
            className={`nav-arrow nav-next ${currentIndex === cards.length - 1 ? 'hidden' : ''}`}
            onClick={goNext}
            disabled={currentIndex === cards.length - 1}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Next Card Preview */}
          {currentIndex < cards.length - 1 && (
            <div className="side-card side-card-next" onClick={goNext}>
              <div className="side-card-content">
                <span className="side-card-label">
                  {cards[currentIndex + 1].letter || cards[currentIndex + 1].number || cards[currentIndex + 1].emoji}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="card-footer">
        {/* Card Position */}
        <div className="card-position">
          <span className="position-current">{currentIndex + 1}</span>
          <span className="position-divider">of</span>
          <span className="position-total">{cards.length}</span>
        </div>

        {/* Mastered Button */}
        <div className="mastered-btn-wrapper">
          {/* Star Burst Effect */}
          {starBurst && (
            <div className="star-burst">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="star" style={{ '--i': i }}>⭐</span>
              ))}
            </div>
          )}
          <button
            className={`mastered-btn ${isMastered ? 'is-mastered' : ''} ${starBurst ? 'burst' : ''}`}
            onClick={(e) => handleMastered(currentCard, e)}
            disabled={isMastered}
          >
            {isMastered ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Learned!</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>I Know This!</span>
              </>
            )}
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="thumbnail-strip">
          {getVisibleThumbnails().map(({ index, card }) => (
            <button
              key={card.id}
              className={`thumbnail ${index === currentIndex ? 'active' : ''} ${progress?.mastered?.includes(card.id) ? 'mastered' : ''}`}
              onClick={() => goToCard(index)}
            >
              <span className="thumbnail-content">
                {card.letter || card.number || card.emoji || (index + 1)}
              </span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default CardDeck;
