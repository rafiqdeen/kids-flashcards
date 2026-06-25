import { createRoot } from 'react-dom/client';
import './adventure/tv.js'; // resolve TV mode + set <html data-tv> BEFORE first paint
import './adventure/styles/tokens.css';
import './adventure/styles/adventure.css';
import { AdventureApp } from './adventure/index.jsx';

// The prototype renders <AdventureApp> directly (no StrictMode); we match that
// so dev double-invocation can't desync seeded-RNG-dependent first renders.
createRoot(document.getElementById('root')).render(<AdventureApp />);
