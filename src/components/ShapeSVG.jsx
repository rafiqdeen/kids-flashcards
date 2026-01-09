const shapes = {
  circle: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="45" fill="#ef4444" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="10" y="10" width="80" height="80" fill="#3b82f6" rx="4" />
    </svg>
  ),
  triangle: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,8 95,88 5,88" fill="#f97316" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 100 70" width="100%" height="100%">
      <rect x="5" y="5" width="90" height="60" fill="#22c55e" rx="4" />
    </svg>
  ),
  oval: (
    <svg viewBox="0 0 100 70" width="100%" height="100%">
      <ellipse cx="50" cy="35" rx="45" ry="30" fill="#a855f7" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon
        points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
        fill="#eab308"
      />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path
        d="M50,88 C20,60 5,40 5,25 C5,10 20,5 35,5 C42,5 50,12 50,12 C50,12 58,5 65,5 C80,5 95,10 95,25 C95,40 80,60 50,88 Z"
        fill="#ec4899"
      />
    </svg>
  ),
  diamond: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 95,50 50,95 5,50" fill="#06b6d4" />
    </svg>
  ),
  crescent: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path
        d="M 50 5
           C 75 5, 95 25, 95 50
           C 95 75, 75 95, 50 95
           C 65 80, 70 65, 70 50
           C 70 35, 65 20, 50 5 Z"
        fill="#fbbf24"
      />
    </svg>
  ),
  hexagon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill="#8b5cf6" />
    </svg>
  ),
  octagon: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#ef4444" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 100 70" width="100%" height="100%">
      <polygon points="60,5 95,35 60,65 60,45 5,45 5,25 60,25" fill="#14b8a6" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon
        points="40,5 60,5 60,40 95,40 95,60 60,60 60,95 40,95 40,60 5,60 5,40 40,40"
        fill="#f43f5e"
      />
    </svg>
  ),
  ring: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="45" fill="#f97316" />
      <circle cx="50" cy="50" r="25" fill="#fafafa" />
    </svg>
  ),
  spiral: (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path
        d="M50,50
           m0,-5
           a5,5 0 1,1 0,10
           a10,10 0 1,1 0,-20
           a15,15 0 1,1 0,30
           a20,20 0 1,1 0,-40
           a25,25 0 1,1 0,50
           a30,30 0 1,1 0,-60
           a35,35 0 1,1 0,70
           a40,40 0 1,1 0,-80"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function ShapeSVG({ shapeId, className }) {
  const shape = shapes[shapeId];

  if (!shape) {
    return null;
  }

  return (
    <div className={className}>
      {shape}
    </div>
  );
}

export default ShapeSVG;
