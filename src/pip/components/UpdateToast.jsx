import { useRegisterSW } from 'virtual:pwa-register/react';
import { Icon } from './Icon.jsx';

// Wired to the real service-worker waiting state (vite-plugin-pwa):
// needRefresh flips when a new SW is waiting; Refresh activates it and
// reloads. Shown until acted on; dismiss hides for the session.
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;
  return (
    <div className="pwa-toast" role="status" data-testid="pwa-toast">
      <Icon name="sparkle" size={22} />
      <span>A new version is ready!</span>
      <button className="toast-cta" onClick={() => updateServiceWorker(true)}>Refresh</button>
      <button className="toast-x" aria-label="Not now" onClick={() => setNeedRefresh(false)}><Icon name="close" size={18} /></button>
    </div>
  );
}
