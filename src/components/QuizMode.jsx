import { useState, useEffect, useMemo } from 'react';
import ShapeSVG from './ShapeSVG';
import './QuizMode.css';

function QuizMode({ cards, category, onBack, playSound, getDisplayValue }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [mistakes, setMistakes] = useState([]);
  const [showMistakes, setShowMistakes] = useState(false);

  // Generate quiz questions
  const questions = useMemo(() => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const questionCards = shuffledCards.slice(0, Math.min(10, cards.length));

    return questionCards.map((card) => {
      // Get 3 wrong answers
      const wrongAnswers = cards
        .filter((c) => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Combine and shuffle options
      const options = [card, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        card,
        options,
        correctId: card.id,
      };
    });
  }, [cards]);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (selectedAnswer !== null) {
      // Faster feedback for correct answers, more time for wrong answers to see the correct one
      const isCorrect = selectedAnswer === currentQuestion?.correctId;
      const delay = isCorrect ? 800 : 1500;

      const timer = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          setQuizComplete(true);
          playSound?.('celebrate');
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [selectedAnswer, currentQuestionIndex, questions.length, playSound, currentQuestion?.correctId]);

  const handleAnswer = (option) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(option.id);
    setShowResult(true);

    if (option.id === currentQuestion.correctId) {
      setScore(score + 1);
      playSound?.('success');
    } else {
      // Track the mistake for review
      setMistakes((prev) => [
        ...prev,
        {
          question: currentQuestion.card,
          selectedAnswer: option,
          correctAnswer: currentQuestion.card,
        },
      ]);
      playSound?.('error');
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
    setMistakes([]);
    setShowMistakes(false);
    playSound?.('click');
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const message = getMessage(percentage);

    return (
      <div className="quiz-complete">
        <div className="celebration">
          {percentage >= 70 ? (
            <svg className="celebration-icon success" viewBox="0 0 64 64" fill="none">
              {/* Trophy */}
              <path d="M20 8h24v6c0 8-5 14-12 14s-12-6-12-14V8z" fill="url(#trophyGold)"/>
              <path d="M20 8h24v3c0 6-5 10-12 10s-12-4-12-10V8z" fill="url(#trophyShine)"/>
              <rect x="26" y="28" width="12" height="8" fill="url(#trophyGold)"/>
              <rect x="22" y="36" width="20" height="6" rx="2" fill="url(#trophyGold)"/>
              {/* Handles */}
              <path d="M20 10c-4 0-6 2-6 6s2 6 6 6" stroke="url(#trophyGold)" strokeWidth="3" fill="none"/>
              <path d="M44 10c4 0 6 2 6 6s-2 6-6 6" stroke="url(#trophyGold)" strokeWidth="3" fill="none"/>
              {/* Star */}
              <path d="M32 12l2 4 4.5.5-3.25 3 .75 4.5-4-2-4 2 .75-4.5-3.25-3 4.5-.5 2-4z" fill="#fff"/>
              {/* Confetti */}
              <circle cx="10" cy="12" r="2" fill="#f43f5e"/>
              <circle cx="54" cy="14" r="2" fill="#8b5cf6"/>
              <circle cx="8" cy="28" r="1.5" fill="#3b82f6"/>
              <circle cx="56" cy="30" r="1.5" fill="#22c55e"/>
              <rect x="12" y="20" width="3" height="3" rx="0.5" fill="#fbbf24" transform="rotate(30 12 20)"/>
              <rect x="50" y="22" width="3" height="3" rx="0.5" fill="#ec4899" transform="rotate(-20 50 22)"/>
              <defs>
                <linearGradient id="trophyGold" x1="20" y1="8" x2="44" y2="42">
                  <stop stopColor="#fbbf24"/>
                  <stop offset="0.5" stopColor="#f59e0b"/>
                  <stop offset="1" stopColor="#d97706"/>
                </linearGradient>
                <linearGradient id="trophyShine" x1="20" y1="8" x2="44" y2="20">
                  <stop stopColor="#fef3c7" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#fbbf24" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <svg className="celebration-icon encourage" viewBox="0 0 64 64" fill="none">
              {/* Flexed Arm */}
              <path d="M18 44c0-8 6-12 12-12h4c4 0 8 2 10 6l8-16c2-4 6-4 8 0s0 8-2 10l-14 20c-2 3-6 4-10 4h-8c-4 0-8-4-8-8v-4z" fill="url(#armGradient)"/>
              {/* Muscle bulge */}
              <ellipse cx="32" cy="32" rx="6" ry="8" fill="url(#muscleGradient)"/>
              {/* Sparkles */}
              <path d="M48 16l1.5 3 3 .5-2 2.5.5 3-3-1.5-3 1.5.5-3-2-2.5 3-.5 1.5-3z" fill="#fbbf24"/>
              <path d="M12 20l1 2 2 .3-1.5 1.7.3 2-2-1-2 1 .3-2-1.5-1.7 2-.3 1-2z" fill="#f43f5e"/>
              <path d="M52 38l1 2 2 .3-1.5 1.7.3 2-2-1-2 1 .3-2-1.5-1.7 2-.3 1-2z" fill="#8b5cf6"/>
              <defs>
                <linearGradient id="armGradient" x1="18" y1="28" x2="50" y2="56">
                  <stop stopColor="#fbbf24"/>
                  <stop offset="1" stopColor="#f59e0b"/>
                </linearGradient>
                <linearGradient id="muscleGradient" x1="26" y1="24" x2="38" y2="40">
                  <stop stopColor="#fcd34d" stopOpacity="0.6"/>
                  <stop offset="1" stopColor="#f59e0b" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>
        <h2>Quiz Complete!</h2>
        <div className="final-score">
          <span className="score-number">{score}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{questions.length}</span>
        </div>
        <p className="score-percentage">{percentage}% correct</p>
        <p className="score-message">{message}</p>

        {mistakes.length > 0 && (
          <div className="mistakes-section">
            <button
              className="review-mistakes-btn"
              onClick={() => setShowMistakes(!showMistakes)}
            >
              {showMistakes ? '▲ Hide' : '▼ Review'} {mistakes.length} Mistake{mistakes.length !== 1 ? 's' : ''}
            </button>

            {showMistakes && (
              <div className="mistakes-list">
                {mistakes.map((mistake, index) => (
                  <div key={index} className="mistake-item">
                    <div className="mistake-question">
                      {mistake.question.image ? (
                        <img className="mistake-image" src={mistake.question.image} alt={mistake.question.name || 'mistake'} />
                      ) : mistake.question.emoji ? (
                        <span className="mistake-emoji">{mistake.question.emoji}</span>
                      ) : mistake.question.hex ? (
                        <div className="mistake-color" style={{ backgroundColor: mistake.question.hex }} />
                      ) : (
                        <span className="mistake-symbol">{mistake.question.number || mistake.question.letter}</span>
                      )}
                    </div>
                    <div className="mistake-answers">
                      <div className="mistake-wrong">
                        <span className="mistake-label">You said:</span>
                        <span className="mistake-value">{getDisplayValue(mistake.selectedAnswer)}</span>
                      </div>
                      <div className="mistake-correct">
                        <span className="mistake-label">Correct:</span>
                        <span className="mistake-value">{getDisplayValue(mistake.correctAnswer)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="quiz-complete-buttons">
          <button className="restart-button haptic-tap" onClick={handleRestart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Try Again
          </button>
          <button className="back-button haptic-tap" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-mode">
      {/* Glassmorphism Header */}
      <header className="quiz-header">
        <button className="quiz-back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="quiz-title">{category} Quiz</h2>
        <div className="quiz-score">
          <svg className="score-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{score}/{currentQuestionIndex}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="quiz-progress-container">
        <div className="quiz-progress">
          <div
            className="quiz-progress-bar"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="question-counter">
          {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="quiz-question">
          {(() => {
            if (category === 'Shapes') {
              return <ShapeSVG shapeId={currentQuestion.card.id} className="question-shape" />;
            } else if (currentQuestion.card.image) {
              return (
                <img className="question-image" src={currentQuestion.card.image} alt="quiz" />
              );
            } else if (currentQuestion.card.emoji) {
              return <span className="question-emoji" role="img" aria-label="quiz">{currentQuestion.card.emoji}</span>;
            } else if (currentQuestion.card.hex) {
              return <div className="question-color" style={{ backgroundColor: currentQuestion.card.hex }} />;
            } else if (currentQuestion.card.visual) {
              return <span className="question-visual">{currentQuestion.card.visual}</span>;
            } else {
              return <span className="question-number">{currentQuestion.card.number || currentQuestion.card.letter}</span>;
            }
          })()}
          <p className="question-text">What is this?</p>
        </div>
      </div>

      <div className="quiz-options">
        {currentQuestion.options.map((option) => {
          let className = 'quiz-option haptic-tap';
          if (showResult) {
            if (option.id === currentQuestion.correctId) {
              className += ' correct';
            } else if (option.id === selectedAnswer) {
              className += ' wrong';
            }
          }

          return (
            <button
              key={option.id}
              className={className}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              {getDisplayValue(option)}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`result-feedback ${selectedAnswer === currentQuestion.correctId ? 'correct' : 'wrong'}`}>
          {selectedAnswer === currentQuestion.correctId
            ? '✓ Correct!'
            : `✗ The answer was: ${getDisplayValue(currentQuestion.card)}`}
        </div>
      )}
    </div>
  );
}

function getMessage(percentage) {
  if (percentage === 100) return 'Perfect! You are a superstar!';
  if (percentage >= 80) return 'Amazing job! Keep it up!';
  if (percentage >= 60) return 'Good work! Practice makes perfect!';
  if (percentage >= 40) return 'Nice try! Keep learning!';
  return "Don't give up! Try the cards again!";
}

export default QuizMode;
