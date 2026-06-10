import { useState, useEffect } from 'react';
import CategorySelector from './components/CategorySelector';
import CardDeck from './components/CardDeck';
import QuizMode from './components/QuizMode';
import ShapeSVG from './components/ShapeSVG';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { useProgress } from './hooks/useProgress';
import { useSound } from './hooks/useSound';
import { useSpeech } from './hooks/useSpeech';
import { useSettings } from './hooks/useSettings';
import { useViewport } from './hooks/useViewport';
import { Lab } from './pip/Lab.jsx';
import { alphabet } from './data/alphabet';
import { numbers } from './data/numbers';
import { animals } from './data/animals';
import { fruits } from './data/fruits';
import { vegetables } from './data/vegetables';
import { birds } from './data/birds';
import { colors } from './data/colorsShapes';
import { shapes } from './data/shapes';
import { vehicles } from './data/vehicles';
import { bodyParts } from './data/bodyParts';
import { weather } from './data/weather';
import { emotions } from './data/emotions';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, cards, quiz
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('enter'); // enter, exit
  const { progress, lastCategory, markViewed, markMastered, getCategoryProgress } = useProgress();
  useSettings(); // applies data-theme / data-direction to the app root
  useViewport(); // applies web / tablet breakpoint classes
  const isLab = window.location.search.includes('pip-lab');
  const { playSound } = useSound();
  const { speakWord, speakLetter, speakNumber, speakPhrase } = useSpeech();

  // Handle page transition class
  const getTransitionClass = () => {
    if (!isTransitioning) return 'page-transition-enter-active';
    return transitionDirection === 'enter' ? 'page-transition-enter' : 'page-transition-exit';
  };

  const handleSpeak = (text, type = 'word') => {
    switch (type) {
      case 'letter':
        speakLetter(text);
        break;
      case 'number':
        speakNumber(text);
        break;
      case 'phrase':
        speakPhrase(text);
        break;
      default:
        speakWord(text);
    }
  };

  // Smooth view transition helper
  const transitionToView = (newView, callback) => {
    setIsTransitioning(true);
    setTransitionDirection('exit');

    setTimeout(() => {
      callback?.();
      setTransitionDirection('enter');

      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  const handleSelectCategory = (categoryId) => {
    transitionToView('cards', () => {
      setCurrentCategory(categoryId);
      setCurrentView('cards');
    });
    playSound('click');
  };

  const handleBackToHome = () => {
    transitionToView('home', () => {
      setCurrentView('home');
      setCurrentCategory(null);
    });
    playSound('click');
  };

  const handleStartQuiz = () => {
    transitionToView('quiz', () => {
      setCurrentView('quiz');
    });
    playSound('click');
  };

  const handleBackToCards = () => {
    transitionToView('cards', () => {
      setCurrentView('cards');
    });
    playSound('click');
  };

  const getCategoryData = () => {
    switch (currentCategory) {
      case 'alphabet':
        return alphabet;
      case 'numbers':
        return numbers;
      case 'animals':
        return animals;
      case 'fruits':
        return fruits;
      case 'vegetables':
        return vegetables;
      case 'birds':
        return birds;
      case 'colors':
        return colors;
      case 'shapes':
        return shapes;
      case 'vehicles':
        return vehicles;
      case 'bodyparts':
        return bodyParts;
      case 'weather':
        return weather;
      case 'emotions':
        return emotions;
      default:
        return [];
    }
  };

  const getCategoryName = () => {
    switch (currentCategory) {
      case 'alphabet':
        return 'Alphabet';
      case 'numbers':
        return 'Numbers';
      case 'animals':
        return 'Animals';
      case 'fruits':
        return 'Fruits';
      case 'vegetables':
        return 'Vegetables';
      case 'birds':
        return 'Birds';
      case 'colors':
        return 'Colors';
      case 'shapes':
        return 'Shapes';
      case 'vehicles':
        return 'Vehicles';
      case 'bodyparts':
        return 'Body Parts';
      case 'weather':
        return 'Weather';
      case 'emotions':
        return 'Emotions';
      default:
        return '';
    }
  };

  const getCategoryColor = () => {
    switch (currentCategory) {
      case 'alphabet':
        return '#6366f1';
      case 'numbers':
        return '#14b8a6';
      case 'animals':
        return '#f43f5e';
      case 'fruits':
        return '#f59e0b';
      case 'vegetables':
        return '#22c55e';
      case 'birds':
        return '#0ea5e9';
      case 'colors':
        return '#a855f7';
      case 'shapes':
        return '#8b5cf6';
      case 'vehicles':
        return '#ef4444';
      case 'bodyparts':
        return '#ec4899';
      case 'weather':
        return '#06b6d4';
      case 'emotions':
        return '#eab308';
      default:
        return '#6366f1';
    }
  };

  const renderCardFront = (card) => {
    const categoryName = getCategoryName();

    switch (currentCategory) {
      case 'alphabet':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-letter">{card.letter}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'numbers':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-number">{card.number}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'animals':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'fruits':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'vegetables':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'birds':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'colors':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <div className="color-circle" style={{ backgroundColor: card.hex }} />
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'shapes':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <ShapeSVG shapeId={card.id} className="card-shape-svg" />
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'vehicles':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'bodyparts':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'weather':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'emotions':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      default:
        return null;
    }
  };

  const SpeakButton = ({ text, type = 'word' }) => (
    <button
      className="speak-button"
      onClick={(e) => {
        e.stopPropagation();
        handleSpeak(text, type);
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      aria-label={`Listen to ${text}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );

  const renderCardBack = (card) => {
    const categoryName = getCategoryName();

    switch (currentCategory) {
      case 'alphabet':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.word} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.word}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.word}</span>
              <span className="card-hint-badge">{card.hint}</span>
              <SpeakButton text={`${card.letter} is for ${card.word}`} type="phrase" />
            </div>
          </>
        );
      case 'numbers':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-visual">{card.visual}</span>
            <div className="card-word-row">
              <span className="card-word">{card.word}</span>
              <span className="card-hint-badge">{card.hint}</span>
              <SpeakButton text={card.word} type="number" />
            </div>
          </>
        );
      case 'animals':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.sound}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'fruits':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.hint}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'vegetables':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.hint}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'birds':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.sound}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'colors':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <div className="color-circle" style={{ backgroundColor: card.hex }} />
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.example}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'shapes':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <ShapeSVG shapeId={card.id} className="card-shape-svg card-shape-svg-back" />
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.sides > 0 ? `${card.sides} sides` : card.description}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'vehicles':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.sound}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'bodyparts':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.action}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'weather':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.description}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'emotions':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            {card.image ? (
              <img className="card-image" src={card.image} alt={card.name} />
            ) : (
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            )}
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.feeling}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const getQuizDisplayValue = (card) => {
    switch (currentCategory) {
      case 'alphabet':
        return card.word;
      case 'numbers':
        return card.word;
      case 'animals':
      case 'fruits':
      case 'vegetables':
      case 'birds':
      case 'colors':
      case 'shapes':
      case 'vehicles':
      case 'bodyparts':
      case 'weather':
      case 'emotions':
        return card.name;
      default:
        return '';
    }
  };

  if (isLab) {
    return <Lab />;
  }

  if (currentView === 'home') {
    return (
      <div className={getTransitionClass()}>
        <CategorySelector
          onSelect={handleSelectCategory}
          progress={progress}
          lastCategory={lastCategory}
        />
        <PWAUpdatePrompt />
      </div>
    );
  }

  if (currentView === 'quiz') {
    return (
      <div className={getTransitionClass()}>
        <QuizMode
          cards={getCategoryData()}
          category={getCategoryName()}
          onBack={handleBackToCards}
          playSound={playSound}
          getDisplayValue={getQuizDisplayValue}
        />
        <PWAUpdatePrompt />
      </div>
    );
  }

  return (
    <div className={getTransitionClass()}>
      <CardDeck
        cards={getCategoryData()}
        category={getCategoryName()}
        categoryColor={getCategoryColor()}
        renderFront={renderCardFront}
        renderBack={renderCardBack}
        onBack={handleBackToHome}
        onStartQuiz={handleStartQuiz}
        progress={getCategoryProgress(currentCategory)}
        onCardViewed={(cardId) => markViewed(currentCategory, cardId)}
        onCardMastered={(cardId) => markMastered(currentCategory, cardId)}
        playSound={playSound}
      />
      <PWAUpdatePrompt />
    </div>
  );
}

export default App;
