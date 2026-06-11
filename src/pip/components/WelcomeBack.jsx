import { Mascot } from './Mascot.jsx';

export function WelcomeBack({ show, mascot }) {
  if (!show) return null;
  return (
    <div className="welcome-back" data-testid="welcome-back" aria-hidden="true">
      <Mascot concept={mascot} state="cheer" size={84} />
      <b>Welcome back!</b>
    </div>
  );
}
