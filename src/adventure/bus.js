// bus.js — the caption event bus. announce() broadcasts a spoken line so the
// global <Caption> can show it. Kept separate so component files only export
// components (per react-refresh).
export const announce = (t) => window.dispatchEvent(new CustomEvent('adv-cap', { detail: t }));
