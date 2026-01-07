import { useState, useEffect, useMemo } from 'react';
import './QuizMode.css';

function QuizMode({ cards, category, onBack, playSound, getDisplayValue }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

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
      const timer = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          setQuizComplete(true);
          playSound?.('celebrate');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedAnswer, currentQuestionIndex, questions.length, playSound]);

  const handleAnswer = (option) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(option.id);
    setShowResult(true);

    if (option.id === currentQuestion.correctId) {
      setScore(score + 1);
      playSound?.('success');
    } else {
      playSound?.('error');
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
    playSound?.('click');
  };

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const message = getMessage(percentage);

    return (
      <div className="quiz-complete">
        <div className="celebration">
          {percentage >= 70 ? '🎉' : '💪'}
        </div>
        <h2>Quiz Complete!</h2>
        <div className="final-score">
          <span className="score-number">{score}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{questions.length}</span>
        </div>
        <p className="score-percentage">{percentage}% correct</p>
        <p className="score-message">{message}</p>
        <div className="quiz-complete-buttons">
          <button className="restart-button" onClick={handleRestart}>
            🔄 Try Again
          </button>
          <button className="back-button" onClick={onBack}>
            ← Back to Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-mode">
      <div className="quiz-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="quiz-title">{category} Quiz</h2>
        <div className="quiz-score">
          Score: {score}/{currentQuestionIndex}
        </div>
      </div>

      <div className="quiz-progress">
        <div
          className="quiz-progress-bar"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="question-counter">
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>

      <div className="quiz-question">
        {currentQuestion.card.emoji ? (
          <span className="question-emoji" role="img" aria-label="quiz">{currentQuestion.card.emoji}</span>
        ) : currentQuestion.card.hex ? (
          <div className="question-color" style={{ backgroundColor: currentQuestion.card.hex }} />
        ) : currentQuestion.card.visual ? (
          <span className="question-visual">{currentQuestion.card.visual}</span>
        ) : (
          <span className="question-number">{currentQuestion.card.number || currentQuestion.card.letter}</span>
        )}
        <p className="question-text">What is this?</p>
      </div>

      <div className="quiz-options">
        {currentQuestion.options.map((option) => {
          let className = 'quiz-option';
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
