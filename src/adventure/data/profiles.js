// profiles.js — profile storage layer (was window.PipProfiles in the
// prototype). Profiles + active id live in localStorage; each profile
// namespaces its own progress/settings/paint by id.
const PKEY = 'pip-profiles', AKEY = 'pip-active';

export const loadProfiles = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || []; } catch { return []; } };
export const saveProfiles = (p) => { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch { /* private mode */ } };
export const getActiveId = () => { try { return localStorage.getItem(AKEY); } catch { return null; } };
export const setActiveId = (id) => { try { localStorage.setItem(AKEY, id); } catch { /* private mode */ } };
export const newId = () => 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1000);

export const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
export const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
