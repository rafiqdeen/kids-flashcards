// buddy.js — buddy metadata + the app-wide BuddyContext (kept separate from
// Mascot.jsx so that file only exports components, per react-refresh).
import { createContext } from 'react';

export const MASCOT_CONCEPTS = ['pip', 'fox', 'owl', 'bear', 'bunny', 'monster'];
export const BUDDY_LABELS = { pip: 'Pip', fox: 'Fox', owl: 'Owl', bear: 'Bear', bunny: 'Bunny', monster: 'Monster' };
// The chosen hero buddy flows to every <HeroMascot> instance.
export const BuddyContext = createContext('pip');
