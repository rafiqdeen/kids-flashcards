import { useRegisterSW } from 'virtual:pwa-register/react';
import './PWAUpdatePrompt.css';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="pwa-update-prompt">
      <span className="pwa-update-icon">✨</span>
      <p className="pwa-update-text">New content available!</p>
      <div className="pwa-update-buttons">
        <button
          className="pwa-update-btn pwa-update-btn-primary"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </button>
        <button
          className="pwa-update-btn pwa-update-btn-secondary"
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
      </div>
    </div>
  );
}
