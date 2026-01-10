import { useState, useCallback, useEffect, useRef } from 'react';
import FlashCard from './FlashCard';
import ShapeSVG from './ShapeSVG';
import './CardDeck.css';

function CardDeck({
  cards,
  category,
  categoryColor,
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
  const [hasFlippedCurrent, setHasFlippedCurrent] = useState(false);
  const [showCategoryComplete, setShowCategoryComplete] = useState(false);

  // Refs for keyboard/gesture control
  const containerRef = useRef(null);
  const flashCardRef = useRef(null);

  // Trackpad/wheel gesture state
  const wheelAccumulator = useRef(0);
  const wheelTimeout = useRef(null);

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
      setHasFlippedCurrent(false);
      playSound?.('click');
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection('prev');
      setCurrentIndex(currentIndex - 1);
      setHasFlippedCurrent(false);
      playSound?.('click');
    }
  };

  const goToCard = (index) => {
    if (index !== currentIndex && index >= 0 && index < cards.length) {
      setDirection(index > currentIndex ? 'next' : 'prev');
      setCurrentIndex(index);
      setHasFlippedCurrent(false);
      playSound?.('click');
    }
  };

  const handleFlip = (card, isFlipped) => {
    if (isFlipped) {
      setHasFlippedCurrent(true);
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

    // Check if category is now complete (including this card)
    const newMasteredCount = (progress?.mastered?.length || 0) + 1;
    if (newMasteredCount >= cards.length) {
      setTimeout(() => {
        setShowCategoryComplete(true);
        playSound?.('celebrate');
      }, 800);
    }
  };

  const currentCard = cards[currentIndex];
  const isMastered = progress?.mastered?.includes(currentCard?.id);
  const masteredCount = progress?.mastered?.length || 0;

  // Handle touch/swipe for mobile
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

  // Handle trackpad/mouse wheel horizontal swipe
  const handleWheel = useCallback((e) => {
    // Detect horizontal scroll (trackpad gesture)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();

      // Accumulate wheel delta for smoother gesture detection
      wheelAccumulator.current += e.deltaX;

      // Clear previous timeout
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }

      // Navigate when accumulated delta exceeds threshold
      const threshold = 50;
      if (Math.abs(wheelAccumulator.current) > threshold) {
        if (wheelAccumulator.current > 0) {
          goNext();
        } else {
          goPrev();
        }
        wheelAccumulator.current = 0;
      }

      // Reset accumulator after gesture ends
      wheelTimeout.current = setTimeout(() => {
        wheelAccumulator.current = 0;
      }, 150);
    }
  }, [currentIndex, cards.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goNext();
        break;
      case ' ': // Space
      case 'Enter':
        e.preventDefault();
        if (flashCardRef.current) {
          flashCardRef.current.flip();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onBack?.();
        break;
      default:
        break;
    }
  }, [currentIndex, cards.length, onBack]);

  // Auto-focus on mount and add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.focus();

      // Add wheel event listener with passive: false for preventDefault
      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

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
      ref={containerRef}
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
        <div className="header-top-row">
          <button className="header-btn back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <h1 className="header-title">{category}</h1>

          <div className="header-center">
            <div className="step-progress">
              <div className="step-track">
                <div
                  className="step-track-fill"
                  style={{ width: `${(masteredCount / cards.length) * 100}%` }}
                />
              </div>
              <div className="step-markers">
                <div className={`step-marker ${masteredCount >= 1 ? 'completed' : ''} ${masteredCount === 0 ? 'current' : ''}`}>
                  <span className="step-dot" />
                </div>
                <div className={`step-marker ${masteredCount >= Math.ceil(cards.length / 2) ? 'completed' : ''} ${masteredCount > 0 && masteredCount < Math.ceil(cards.length / 2) ? 'current' : ''}`}>
                  <span className="step-dot" />
                </div>
                <div className={`step-marker ${masteredCount >= cards.length ? 'completed' : ''} ${masteredCount >= Math.ceil(cards.length / 2) && masteredCount < cards.length ? 'current' : ''}`}>
                  <span className="step-dot" />
                </div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <span className="progress-text">{masteredCount}/{cards.length}</span>
            <button className="header-btn quiz-btn haptic-tap" onClick={onStartQuiz}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9a3 3 0 115.12 2.12c-.58.59-1.12 1.3-1.12 2.38v.5M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Quiz</span>
            </button>
          </div>
        </div>
      </header>

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
                {cards[currentIndex - 1].letter ? (
                  <span className="side-card-label">
                    {cards[currentIndex - 1].letter}
                  </span>
                ) : category === 'Shapes' ? (
                  <ShapeSVG shapeId={cards[currentIndex - 1].id} className="side-card-shape" />
                ) : cards[currentIndex - 1].image ? (
                  <img className="side-card-image" src={cards[currentIndex - 1].image} alt="" />
                ) : (
                  <span className="side-card-label">
                    {cards[currentIndex - 1].number || cards[currentIndex - 1].emoji}
                  </span>
                )}
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
                ref={flashCardRef}
                frontContent={renderFront(currentCard)}
                backContent={renderBack(currentCard)}
                onFlip={(isFlipped) => handleFlip(currentCard, isFlipped)}
                cardType={category.toLowerCase()}
                categoryColor={categoryColor}
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
                {cards[currentIndex + 1].letter ? (
                  <span className="side-card-label">
                    {cards[currentIndex + 1].letter}
                  </span>
                ) : category === 'Shapes' ? (
                  <ShapeSVG shapeId={cards[currentIndex + 1].id} className="side-card-shape" />
                ) : cards[currentIndex + 1].image ? (
                  <img className="side-card-image" src={cards[currentIndex + 1].image} alt="" />
                ) : (
                  <span className="side-card-label">
                    {cards[currentIndex + 1].number || cards[currentIndex + 1].emoji}
                  </span>
                )}
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

        {/* Streak + Mastered Row */}
        <div className="footer-actions">
          {/* Streak Counter */}
          {streak > 0 && (
            <div className={`streak-counter ${streak >= 5 ? 'hot' : ''} ${streak >= 10 ? 'fire' : ''}`}>
              <svg className="streak-flame" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 23C7.58 23 4 19.42 4 15C4 12.23 5.81 9.33 7.5 7.5C7.5 7.5 8.5 10 10 10C10 10 9 6 12 2C13.5 5 14.5 6.5 16 7C17.5 7.5 19 8.5 19.5 10C20 11.5 20 13 20 15C20 19.42 16.42 23 12 23Z"
                  fill="url(#fireGradient)"
                />
                <path
                  d="M12 23C9.79 23 8 21.21 8 19C8 17.5 9 16 10 15C10 15 10.5 16.5 12 16.5C12 16.5 11 14 12 12C12.75 13.5 13.5 14 14 14.5C14.5 15 15 15.5 15.5 16.5C16 17.5 16 18.5 16 19C16 21.21 14.21 23 12 23Z"
                  fill="url(#fireInnerGradient)"
                />
                <defs>
                  <linearGradient id="fireGradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FBBF24"/>
                    <stop offset="0.5" stopColor="#F97316"/>
                    <stop offset="1" stopColor="#EF4444"/>
                  </linearGradient>
                  <linearGradient id="fireInnerGradient" x1="12" y1="12" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FEF3C7"/>
                    <stop offset="1" stopColor="#FBBF24"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="streak-count">{streak}</span>
            </div>
          )}

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
            className={`mastered-btn haptic-tap ${isMastered ? 'is-mastered' : ''} ${starBurst ? 'burst' : ''} ${!hasFlippedCurrent && !isMastered ? 'not-ready' : ''}`}
            onClick={(e) => handleMastered(currentCard, e)}
            disabled={isMastered || !hasFlippedCurrent}
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
        </div>

        {/* Thumbnail Strip */}
        <div className="thumbnail-strip">
          {getVisibleThumbnails().map(({ index, card }) => (
            <button
              key={card.id}
              className={`thumbnail haptic-tap ${index === currentIndex ? 'active' : ''} ${progress?.mastered?.includes(card.id) ? 'mastered' : ''}`}
              onClick={() => goToCard(index)}
            >
              {card.letter ? (
                <span className="thumbnail-content">{card.letter}</span>
              ) : category === 'Shapes' ? (
                <ShapeSVG shapeId={card.id} className="thumbnail-shape" />
              ) : card.image ? (
                <img className="thumbnail-image" src={card.image} alt="" />
              ) : (
                <span className="thumbnail-content">
                  {card.number || card.emoji || (index + 1)}
                </span>
              )}
            </button>
          ))}
        </div>
      </footer>

      {/* Category Completion Celebration */}
      {showCategoryComplete && (
        <div className="completion-celebration" onClick={() => setShowCategoryComplete(false)}>
          <div className="celebration-confetti">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#f43f5e', '#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
                  animationDelay: `${Math.random() * 2}s`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
          <div className="celebration-content">
            <svg className="celebration-trophy" viewBox="0 0 64 64" fill="none">
              <path d="M20 8h24v6c0 8-5 14-12 14s-12-6-12-14V8z" fill="url(#trophyGoldCeleb)"/>
              <path d="M20 8h24v3c0 6-5 10-12 10s-12-4-12-10V8z" fill="url(#trophyShineCeleb)"/>
              <rect x="26" y="28" width="12" height="8" fill="url(#trophyGoldCeleb)"/>
              <rect x="22" y="36" width="20" height="6" rx="2" fill="url(#trophyGoldCeleb)"/>
              <path d="M20 10c-4 0-6 2-6 6s2 6 6 6" stroke="url(#trophyGoldCeleb)" strokeWidth="3" fill="none"/>
              <path d="M44 10c4 0 6 2 6 6s-2 6-6 6" stroke="url(#trophyGoldCeleb)" strokeWidth="3" fill="none"/>
              <path d="M32 12l2 4 4.5.5-3.25 3 .75 4.5-4-2-4 2 .75-4.5-3.25-3 4.5-.5 2-4z" fill="#fff"/>
              <defs>
                <linearGradient id="trophyGoldCeleb" x1="20" y1="8" x2="44" y2="42">
                  <stop stopColor="#fbbf24"/>
                  <stop offset="0.5" stopColor="#f59e0b"/>
                  <stop offset="1" stopColor="#d97706"/>
                </linearGradient>
                <linearGradient id="trophyShineCeleb" x1="20" y1="8" x2="44" y2="20">
                  <stop stopColor="#fef3c7" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#fbbf24" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
            <h2 className="celebration-title">Amazing!</h2>
            <p className="celebration-subtitle">You've mastered all {cards.length} {category} cards!</p>
            <button className="celebration-btn" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Categories
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardDeck;
