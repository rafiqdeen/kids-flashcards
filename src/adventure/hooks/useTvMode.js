// useTvMode — exposes the boot-resolved TV-mode flag + its setter to React.
// TV mode is resolved once at boot in tv.js and changing it reloads the app, so a
// static read is correct for the lifetime of a render tree (no subscription needed).
import { isTvMode, setTvMode } from '../tv.js';

export function useTvMode() {
  return [isTvMode(), setTvMode];
}
