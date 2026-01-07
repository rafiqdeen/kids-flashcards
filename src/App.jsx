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
    switch (currentCategory) {
      case 'alphabet':
        return (
          <>
            <span className="card-letter">{card.letter}</span>
            <span className="card-hint">Tap to see!</span>
          </>
        );
      case 'numbers':
        return (
          <>
            <span className="card-number">{card.number}</span>
            <span className="card-hint">{card.word}</span>
          </>
        );
      case 'animals':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What animal is this?</span>
          </>
        );
      case 'fruits':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What fruit is this?</span>
          </>
        );
      case 'vegetables':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What vegetable is this?</span>
          </>
        );
      case 'birds':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What bird is this?</span>
          </>
        );
      case 'colors':
        if (card.hex) {
          return (
            <>
              <div
                className="color-circle"
                style={{ backgroundColor: card.hex }}
              />
              <span className="card-hint">What color is this?</span>
            </>
          );
        } else {
          return (
            <>
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
              <span className="card-hint">What shape is this?</span>
            </>
          );
        }
      case 'vehicles':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What vehicle is this?</span>
          </>
        );
      case 'bodyparts':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What body part is this?</span>
          </>
        );
      case 'weather':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">What weather is this?</span>
          </>
        );
      case 'emotions':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
            <span className="card-hint">How does this feel?</span>
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
    switch (currentCategory) {
      case 'alphabet':
        return (
          <>
            <span className="card-emoji" role="img" aria-label={card.word}>{card.emoji}</span>
            <div className="card-word-row">
              <span className="card-word">{card.word}</span>
              <SpeakButton text={`${card.letter} is for ${card.word}`} type="phrase" />
            </div>
          </>
        );
      case 'numbers':
        return (
          <>
            <span className="card-visual">{card.visual}</span>
            <div className="card-word-row">
              <span className="card-word">{card.word}</span>
              <SpeakButton text={card.word} type="number" />
            </div>
            <span className="card-hint">{card.hint}</span>
          </>
        );
      case 'animals':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">{card.sound}</span>
            <span className="card-hint">Lives in: {card.habitat}</span>
          </>
        );
      case 'fruits':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">Color: {card.color}</span>
            <span className="card-hint">{card.hint}</span>
          </>
        );
      case 'vegetables':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">Color: {card.color}</span>
            <span className="card-hint">{card.hint}</span>
          </>
        );
      case 'birds':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">{card.sound}</span>
            <span className="card-hint">Lives in: {card.habitat}</span>
          </>
        );
      case 'colors':
        if (card.hex) {
          return (
            <>
              <span className="card-emoji" role="img" aria-label={card.name}>{card.emoji}</span>
              <div className="card-word-row">
                <span className="card-word">{card.name}</span>
                <SpeakButton text={card.name} />
              </div>
              <span className="card-hint">{card.example}</span>
            </>
          );
        } else {
          return (
            <>
              <div className="card-word-row">
                <span className="card-word">{card.name}</span>
                <SpeakButton text={card.name} />
              </div>
              <span className="card-hint">{card.description}</span>
              {card.sides > 0 && (
                <span className="card-hint">{card.sides} sides</span>
              )}
            </>
          );
        }
      case 'vehicles':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">{card.sound}</span>
            <span className="card-hint">Type: {card.type}</span>
          </>
        );
      case 'bodyparts':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">{card.action}</span>
            <span className="card-hint">We have: {card.count}</span>
          </>
        );
      case 'weather':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">{card.description}</span>
            <span className="card-hint">Feels: {card.temperature}</span>
          </>
        );
      case 'emotions':
        return (
          <>
            <div className="card-word-row">
              <span className="card-word">{card.name}</span>
              <SpeakButton text={card.name} />
            </div>
            <span className="card-hint">{card.feeling}</span>
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
