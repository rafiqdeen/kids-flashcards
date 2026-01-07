import { useState } from 'react';
import CategorySelector from './components/CategorySelector';
import CardDeck from './components/CardDeck';
import QuizMode from './components/QuizMode';
import { useProgress } from './hooks/useProgress';
import { useSound } from './hooks/useSound';
import { useSpeech } from './hooks/useSpeech';
import { alphabet } from './data/alphabet';
import { numbers } from './data/numbers';
import { animals } from './data/animals';
import { fruits } from './data/fruits';
import { vegetables } from './data/vegetables';
import { birds } from './data/birds';
import { colorsShapes } from './data/colorsShapes';
import { vehicles } from './data/vehicles';
import { bodyParts } from './data/bodyParts';
import { weather } from './data/weather';
import { emotions } from './data/emotions';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, cards, quiz
  const [currentCategory, setCurrentCategory] = useState(null);
  const { progress, markViewed, markMastered, getCategoryProgress } = useProgress();
  const { playSound } = useSound();
  const { speakWord, speakLetter, speakNumber, speakPhrase } = useSpeech();

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

  const handleSelectCategory = (categoryId) => {
    setCurrentCategory(categoryId);
    setCurrentView('cards');
    playSound('click');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentCategory(null);
    playSound('click');
  };

  const handleStartQuiz = () => {
    setCurrentView('quiz');
    playSound('click');
  };

  const handleBackToCards = () => {
    setCurrentView('cards');
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
        return colorsShapes;
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
        return 'Colors & Shapes';
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'fruits':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'vegetables':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'birds':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'colors':
        if (card.hex) {
          return (
            <>
              <span className="card-category">{categoryName}</span>
              <div className="color-circle" style={{ backgroundColor: card.hex }} />
              <span className="card-tap-hint">Tap to reveal</span>
            </>
          );
        } else {
          return (
            <>
              <span className="card-category">{categoryName}</span>
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
              <span className="card-tap-hint">Tap to reveal</span>
            </>
          );
        }
      case 'vehicles':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'bodyparts':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'weather':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-tap-hint">Tap to reveal</span>
          </>
        );
      case 'emotions':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
      aria-label={`Listen to ${text}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
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
            <span className="card-emoji" role="img" aria-label={card.word}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <span className="card-hint-badge">{card.sound}</span>
              <SpeakButton text={card.name} />
            </div>
          </>
        );
      case 'colors':
        if (card.hex) {
          return (
            <>
              <span className="card-category">{categoryName}</span>
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
              <div className="card-word-row">
                <span className="card-word">{card.name}</span>
                <span className="card-hint-badge">{card.example}</span>
                <SpeakButton text={card.name} />
              </div>
            </>
          );
        } else {
          return (
            <>
              <span className="card-category">{categoryName}</span>
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
              <div className="card-word-row">
                <span className="card-word">{card.name}</span>
                <span className="card-hint-badge">{card.description}</span>
                <SpeakButton text={card.name} />
              </div>
            </>
          );
        }
      case 'vehicles':
        return (
          <>
            <span className="card-category">{categoryName}</span>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
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
      case 'vehicles':
      case 'bodyparts':
      case 'weather':
      case 'emotions':
        return card.name;
      default:
        return '';
    }
  };

  if (currentView === 'home') {
    return (
      <CategorySelector
        onSelect={handleSelectCategory}
        progress={progress}
      />
    );
  }

  if (currentView === 'quiz') {
    return (
      <QuizMode
        cards={getCategoryData()}
        category={getCategoryName()}
        onBack={handleBackToCards}
        playSound={playSound}
        getDisplayValue={getQuizDisplayValue}
      />
    );
  }

  return (
    <CardDeck
      cards={getCategoryData()}
      category={getCategoryName()}
      renderFront={renderCardFront}
      renderBack={renderCardBack}
      onBack={handleBackToHome}
      onStartQuiz={handleStartQuiz}
      progress={getCategoryProgress(currentCategory)}
      onCardViewed={(cardId) => markViewed(currentCategory, cardId)}
      onCardMastered={(cardId) => markMastered(currentCategory, cardId)}
      playSound={playSound}
    />
  );
}

export default App;
