import { Icon } from './Icon.jsx';

// state: 'idle' | 'correct' | 'wrong' | 'reveal' | 'disabled'
export function QuizOption({ option, index, state, onPick }) {
  const aria = state === 'correct' ? 'Correct'
    : state === 'wrong' ? 'Try again'
      : state === 'reveal' ? 'This was the answer'
        : undefined;
  return (
    <button
      data-testid={`quiz-option-${index}`}
      className={`quiz-opt ${state}`}
      onClick={() => onPick(index)}
      disabled={state === 'disabled' || state === 'correct' || state === 'reveal'}
      aria-label={`${option.label}${aria ? '. ' + aria : ''}`}
    >
      <span className="quiz-opt-art">{option.render}</span>
      <span className="quiz-opt-label">{option.label}</span>
      {state === 'correct' && <span className="quiz-mark ok"><Icon name="check" size={26} color="#fff" /></span>}
      {state === 'wrong' && <span className="quiz-mark no"><Icon name="close" size={26} color="#fff" /></span>}
      {state === 'reveal' && <span className="quiz-mark rev"><Icon name="check" size={22} color="#fff" /></span>}
    </button>
  );
}
