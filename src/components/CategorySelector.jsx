import './CategorySelector.css';

const categories = [
  {
    id: 'alphabet',
    name: 'Alphabet',
    description: 'Learn A to Z with fun pictures',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    icon: AlphabetIcon,
  },
  {
    id: 'numbers',
    name: 'Numbers',
    description: 'Count from 1 to 10',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
    icon: NumbersIcon,
  },
  {
    id: 'animals',
    name: 'Animals',
    description: 'Meet amazing animals',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    icon: AnimalsIcon,
  },
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Discover delicious fruits',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    icon: FruitsIcon,
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Learn healthy veggies',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    icon: VegetablesIcon,
  },
  {
    id: 'birds',
    name: 'Birds',
    description: 'Explore birds that fly',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    icon: BirdsIcon,
  },
  {
    id: 'colors',
    name: 'Colors & Shapes',
    description: 'Discover colors and shapes',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    icon: ColorsIcon,
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Cars, planes and more!',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    icon: VehiclesIcon,
  },
  {
    id: 'bodyparts',
    name: 'Body Parts',
    description: 'Learn about your body',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    icon: BodyPartsIcon,
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Sun, rain, snow and more',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
    icon: WeatherIcon,
  },
  {
    id: 'emotions',
    name: 'Emotions',
    description: 'How do you feel today?',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    icon: EmotionsIcon,
  },
];

function CategorySelector({ onSelect, progress }) {
  return (
    <div className="category-selector">
      {/* Animated floating background shapes */}
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2 shape-star"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5 shape-star"></div>
        <div className="floating-shape shape-6"></div>
      </div>

      <header className="hero-section">
        <div className="hero-badge">Learning is Fun!</div>
        <h1 className="app-title">Kids Flash Cards</h1>
        <p className="app-subtitle">Tap a card to start your learning adventure</p>
      </header>

      <div className="cards-wrapper">
        <div className="category-scroll">
          {categories.map((category) => {
            const categoryProgress = progress[category.id] || { viewed: [], mastered: [] };
            const totalCards = getCategoryTotal(category.id);
            const masteredCount = categoryProgress.mastered?.length || 0;
            const IconComponent = category.icon;

            return (
              <button
                key={category.id}
                className="category-card"
                style={{
                  '--card-color': category.color,
                  '--card-gradient': category.gradient
                }}
                onClick={() => onSelect(category.id)}
              >
                <div className="card-illustration">
                  <IconComponent />
                </div>
                <div className="card-content">
                  <h2 className="category-name">{category.name}</h2>
                  <p className="category-description">{category.description}</p>
                  {masteredCount > 0 ? (
                    <div className="category-progress">
                      <div className="progress-ring">
                        <svg viewBox="0 0 36 36">
                          <path
                            className="progress-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="progress-fill"
                            strokeDasharray={`${(masteredCount / totalCards) * 100}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="progress-text">{masteredCount}/{totalCards}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="start-badge">Start Learning</div>
                  )}
                </div>
                <div className="card-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="app-footer">
        <p>Made with ❤️ for curious little minds</p>
      </footer>
    </div>
  );
}

function getCategoryTotal(categoryId) {
  switch (categoryId) {
    case 'alphabet': return 26;
    case 'numbers': return 10;
    case 'animals': return 46;
    case 'fruits': return 18;
    case 'vegetables': return 18;
    case 'birds': return 17;
    case 'colors': return 17;
    case 'vehicles': return 21;
    case 'bodyparts': return 18;
    case 'weather': return 22;
    case 'emotions': return 25;
    default: return 0;
  }
}

// SVG Icon Components
function AlphabetIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="30" width="45" height="60" rx="8" fill="rgba(255,255,255,0.9)"/>
      <text x="32" y="75" fontSize="36" fontWeight="bold" fill="#6366f1" textAnchor="middle">A</text>
      <rect x="65" y="30" width="45" height="60" rx="8" fill="rgba(255,255,255,0.7)"/>
      <text x="87" y="75" fontSize="36" fontWeight="bold" fill="#8b5cf6" textAnchor="middle">B</text>
      <circle cx="95" cy="25" r="15" fill="rgba(255,255,255,0.5)"/>
      <text x="95" y="31" fontSize="18" fontWeight="bold" fill="#a855f7" textAnchor="middle">C</text>
    </svg>
  );
}

function NumbersIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="50" r="28" fill="rgba(255,255,255,0.9)"/>
      <text x="35" y="60" fontSize="32" fontWeight="bold" fill="#14b8a6" textAnchor="middle">1</text>
      <circle cx="80" cy="40" r="24" fill="rgba(255,255,255,0.7)"/>
      <text x="80" y="49" fontSize="28" fontWeight="bold" fill="#10b981" textAnchor="middle">2</text>
      <circle cx="75" cy="85" r="20" fill="rgba(255,255,255,0.5)"/>
      <text x="75" y="93" fontSize="24" fontWeight="bold" fill="#059669" textAnchor="middle">3</text>
      <circle cx="30" cy="95" r="12" fill="rgba(255,255,255,0.4)"/>
      <text x="30" y="100" fontSize="14" fontWeight="bold" fill="#047857" textAnchor="middle">4</text>
    </svg>
  );
}

function AnimalsIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cat face */}
      <ellipse cx="60" cy="65" rx="35" ry="30" fill="rgba(255,255,255,0.9)"/>
      {/* Ears */}
      <path d="M30 45 L25 20 L45 35 Z" fill="rgba(255,255,255,0.9)"/>
      <path d="M90 45 L95 20 L75 35 Z" fill="rgba(255,255,255,0.9)"/>
      <path d="M32 43 L29 25 L43 36 Z" fill="#fda4af"/>
      <path d="M88 43 L91 25 L77 36 Z" fill="#fda4af"/>
      {/* Eyes */}
      <ellipse cx="45" cy="60" rx="8" ry="10" fill="#1e293b"/>
      <ellipse cx="75" cy="60" rx="8" ry="10" fill="#1e293b"/>
      <circle cx="47" cy="57" r="3" fill="white"/>
      <circle cx="77" cy="57" r="3" fill="white"/>
      {/* Nose */}
      <ellipse cx="60" cy="72" rx="5" ry="4" fill="#f43f5e"/>
      {/* Mouth */}
      <path d="M60 76 Q55 82 50 78" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M60 76 Q65 82 70 78" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Whiskers */}
      <line x1="20" y1="65" x2="38" y2="70" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="75" x2="38" y2="75" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="82" y1="70" x2="100" y2="65" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="82" y1="75" x2="100" y2="75" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function FruitsIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Apple */}
      <ellipse cx="45" cy="65" rx="28" ry="32" fill="#ef4444"/>
      <ellipse cx="45" cy="65" rx="28" ry="32" fill="url(#appleGradient)"/>
      <path d="M45 33 Q50 28 55 33" stroke="#7c3aed" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="52" cy="30" rx="8" ry="5" fill="#22c55e"/>
      {/* Banana */}
      <path d="M75 40 Q95 50 90 80 Q85 95 70 90" stroke="#fbbf24" strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M75 40 Q95 50 90 80 Q85 95 70 90" stroke="#fcd34d" strokeWidth="10" fill="none" strokeLinecap="round"/>
      {/* Orange */}
      <circle cx="85" cy="95" r="18" fill="#f97316"/>
      <circle cx="85" cy="95" r="18" fill="url(#orangeGradient)"/>
      <defs>
        <radialGradient id="appleGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
        <radialGradient id="orangeGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function VegetablesIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Carrot */}
      <path d="M30 35 L50 95 L35 95 Z" fill="#f97316"/>
      <path d="M32 35 L48 90 L36 90 Z" fill="#fb923c"/>
      <ellipse cx="40" cy="32" rx="15" ry="8" fill="#22c55e"/>
      <path d="M35 30 Q40 15 45 30" stroke="#16a34a" strokeWidth="3" fill="none"/>
      <path d="M38 28 Q40 18 42 28" stroke="#16a34a" strokeWidth="2" fill="none"/>
      {/* Broccoli */}
      <circle cx="75" cy="50" r="18" fill="#22c55e"/>
      <circle cx="90" cy="55" r="14" fill="#16a34a"/>
      <circle cx="80" cy="40" r="12" fill="#4ade80"/>
      <circle cx="65" cy="55" r="10" fill="#16a34a"/>
      <rect x="72" y="65" width="8" height="25" rx="3" fill="#84cc16"/>
      {/* Tomato */}
      <circle cx="40" cy="95" r="16" fill="#ef4444"/>
      <ellipse cx="40" cy="82" rx="8" ry="4" fill="#22c55e"/>
    </svg>
  );
}

function BirdsIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bird body */}
      <ellipse cx="60" cy="60" rx="35" ry="28" fill="rgba(255,255,255,0.9)"/>
      {/* Wing */}
      <ellipse cx="55" cy="65" rx="20" ry="15" fill="#0ea5e9"/>
      <ellipse cx="55" cy="65" rx="15" ry="10" fill="#38bdf8"/>
      {/* Head */}
      <circle cx="85" cy="45" r="18" fill="rgba(255,255,255,0.95)"/>
      {/* Beak */}
      <path d="M100 45 L115 48 L100 52 Z" fill="#f59e0b"/>
      {/* Eye */}
      <circle cx="90" cy="42" r="5" fill="#1e293b"/>
      <circle cx="91" cy="41" r="2" fill="white"/>
      {/* Tail feathers */}
      <path d="M25 55 L5 45 L10 55 L5 65 L25 60 Z" fill="#0ea5e9"/>
      <path d="M25 58 L12 55 L25 62 Z" fill="#38bdf8"/>
      {/* Feet */}
      <path d="M50 85 L45 100 M50 85 L50 100 M50 85 L55 100" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
      <path d="M70 85 L65 100 M70 85 L70 100 M70 85 L75 100" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
      {/* Crest */}
      <path d="M80 30 Q85 20 90 30" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M85 32 Q88 24 92 32" stroke="#f43f5e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function ColorsIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Color palette */}
      <circle cx="40" cy="35" r="20" fill="#ef4444"/>
      <circle cx="75" cy="30" r="18" fill="#f59e0b"/>
      <circle cx="95" cy="55" r="16" fill="#22c55e"/>
      <circle cx="85" cy="85" r="18" fill="#3b82f6"/>
      <circle cx="50" cy="90" r="16" fill="#a855f7"/>
      <circle cx="25" cy="70" r="14" fill="#ec4899"/>
      {/* Center star shape */}
      <path d="M60 50 L63 58 L72 58 L65 64 L68 72 L60 67 L52 72 L55 64 L48 58 L57 58 Z" fill="rgba(255,255,255,0.9)"/>
    </svg>
  );
}

function VehiclesIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Car body */}
      <rect x="15" y="55" width="70" height="30" rx="5" fill="rgba(255,255,255,0.9)"/>
      <path d="M25 55 L35 35 L65 35 L75 55" fill="rgba(255,255,255,0.9)"/>
      {/* Windows */}
      <path d="M30 52 L38 38 L52 38 L52 52 Z" fill="#3b82f6"/>
      <path d="M55 52 L55 38 L62 38 L70 52 Z" fill="#3b82f6"/>
      {/* Wheels */}
      <circle cx="30" cy="85" r="12" fill="#1e293b"/>
      <circle cx="30" cy="85" r="6" fill="#64748b"/>
      <circle cx="70" cy="85" r="12" fill="#1e293b"/>
      <circle cx="70" cy="85" r="6" fill="#64748b"/>
      {/* Airplane */}
      <ellipse cx="100" cy="30" rx="15" ry="8" fill="rgba(255,255,255,0.7)"/>
      <path d="M85 30 L75 25 L75 35 Z" fill="rgba(255,255,255,0.7)"/>
      <path d="M100 30 L100 20 L110 25 Z" fill="#3b82f6"/>
    </svg>
  );
}

function BodyPartsIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand */}
      <path d="M60 100 L60 70 L45 70 L45 50 L55 50 L55 40 L65 40 L65 50 L75 50 L75 70 L60 70"
            fill="rgba(255,255,255,0.9)" stroke="#f472b6" strokeWidth="2"/>
      {/* Fingers */}
      <rect x="35" y="30" width="10" height="25" rx="5" fill="rgba(255,255,255,0.9)"/>
      <rect x="48" y="20" width="10" height="35" rx="5" fill="rgba(255,255,255,0.9)"/>
      <rect x="62" y="20" width="10" height="35" rx="5" fill="rgba(255,255,255,0.9)"/>
      <rect x="76" y="30" width="10" height="25" rx="5" fill="rgba(255,255,255,0.9)"/>
      {/* Heart */}
      <path d="M95 70 C95 60 105 55 105 65 C105 55 115 60 115 70 C115 80 105 90 105 90 C105 90 95 80 95 70" fill="#ef4444"/>
    </svg>
  );
}

function WeatherIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun */}
      <circle cx="40" cy="40" r="20" fill="#fbbf24"/>
      <g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
        <line x1="40" y1="10" x2="40" y2="18"/>
        <line x1="40" y1="62" x2="40" y2="70"/>
        <line x1="10" y1="40" x2="18" y2="40"/>
        <line x1="62" y1="40" x2="70" y2="40"/>
        <line x1="18" y1="18" x2="24" y2="24"/>
        <line x1="56" y1="56" x2="62" y2="62"/>
        <line x1="18" y1="62" x2="24" y2="56"/>
        <line x1="56" y1="24" x2="62" y2="18"/>
      </g>
      {/* Cloud */}
      <ellipse cx="80" cy="70" rx="25" ry="18" fill="rgba(255,255,255,0.9)"/>
      <ellipse cx="65" cy="75" rx="18" ry="14" fill="rgba(255,255,255,0.9)"/>
      <ellipse cx="95" cy="75" rx="15" ry="12" fill="rgba(255,255,255,0.9)"/>
      {/* Rain drops */}
      <path d="M70 95 L68 105" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M85 95 L83 105" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M95 92 L93 100" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function EmotionsIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Happy face */}
      <circle cx="40" cy="45" r="28" fill="#fbbf24"/>
      <circle cx="32" cy="40" r="4" fill="#1e293b"/>
      <circle cx="48" cy="40" r="4" fill="#1e293b"/>
      <path d="M28 52 Q40 65 52 52" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Sad face */}
      <circle cx="85" cy="75" r="22" fill="#60a5fa"/>
      <circle cx="78" cy="70" r="3" fill="#1e293b"/>
      <circle cx="92" cy="70" r="3" fill="#1e293b"/>
      <path d="M75 85 Q85 78 95 85" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Tear */}
      <ellipse cx="78" cy="78" rx="2" ry="4" fill="#3b82f6"/>
      {/* Heart */}
      <path d="M90 25 C90 18 98 15 98 22 C98 15 106 18 106 25 C106 32 98 40 98 40 C98 40 90 32 90 25" fill="#ef4444"/>
    </svg>
  );
}

export default CategorySelector;
