// Mascot — Pip & friends. Parametric SVG buddy: 6 concepts × 5 states.
// <Mascot concept="pip|fox|owl|bear|bunny|monster" state="idle|cheer|encourage|point|sleep" />
const PALETTE = {
  pip: { body: '#fb923c', body2: '#f97316', belly: '#fed7aa', beak: '#f59e0b', cheek: '#fb7185', stroke: '#b45309', foot: '#f59e0b' },
  fox: { body: '#fb7857', body2: '#ef5a35', belly: '#fff1e6', beak: '#5b3a2e', cheek: '#ff9d7d', stroke: '#b23a1a', foot: '#5b3a2e' },
  owl: { body: '#a78bfa', body2: '#8b5cf6', belly: '#ede9fe', beak: '#f59e0b', cheek: '#c4b5fd', stroke: '#6d28d9', foot: '#f59e0b' },
  bear: { body: '#c08a52', body2: '#a06a32', belly: '#ecd7b5', beak: '#5a3a22', cheek: '#e89a6a', stroke: '#6e4a26', foot: '#5a3a22' },
  bunny: { body: '#cdd7e5', body2: '#aebccd', belly: '#eef2f7', beak: '#f472b6', cheek: '#fbb6ce', stroke: '#7d8ba0', foot: '#aebccd', earInner: '#fbb6ce' },
  monster: { body: '#2dd4bf', body2: '#14b8a6', belly: '#ccfbf1', beak: '#0f766e', cheek: '#5eead4', stroke: '#0f766e', foot: '#14b8a6', antenna: '#fb7185' },
};

function Eyes({ c, state }) {
  if (state === 'sleep') {
    return (
      <g stroke={c.stroke} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M36 60 q9 7 18 0" />
        <path d="M82 60 q9 7 18 0" />
      </g>
    );
  }
  if (state === 'cheer' || state === 'encourage') {
    return (
      <g stroke="#2a1d12" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M36 62 q9 -9 18 0" />
        <path d="M82 62 q9 -9 18 0" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="45" cy="60" r="11" fill="#fff" />
      <circle cx="91" cy="60" r="11" fill="#fff" />
      <circle cx="47" cy="62" r="5.5" fill="#2a1d12" />
      <circle cx="93" cy="62" r="5.5" fill="#2a1d12" />
      <circle cx="49" cy="60" r="2" fill="#fff" />
      <circle cx="95" cy="60" r="2" fill="#fff" />
    </g>
  );
}

function Mouth({ c, state }) {
  if (state === 'cheer')
    return <path d="M54 78 q14 20 28 0 q-14 8 -28 0Z" fill="#7c2d12" stroke={c.stroke} strokeWidth="2.5" strokeLinejoin="round" />;
  if (state === 'sleep')
    return <ellipse cx="68" cy="80" rx="5" ry="4" fill="#7c2d12" opacity="0.7" />;
  return <path d="M56 78 q12 12 24 0" fill="none" stroke="#2a1d12" strokeWidth="4" strokeLinecap="round" />;
}

function Ornament({ concept, c }) {
  if (concept === 'pip')
    return <path d="M68 14 q-7 -12 4 -12 q-3 8 6 12Z" fill={c.body2} stroke={c.stroke} strokeWidth="2.5" strokeLinejoin="round" />;
  if (concept === 'fox')
    return (
      <g fill={c.body2} stroke={c.stroke} strokeWidth="3" strokeLinejoin="round">
        <path d="M34 40 L26 8 L52 28Z" />
        <path d="M102 40 L110 8 L84 28Z" />
      </g>
    );
  if (concept === 'bear')
    return (
      <g fill={c.body} stroke={c.stroke} strokeWidth="3.5">
        <circle cx="34" cy="36" r="13" />
        <circle cx="102" cy="36" r="13" />
        <circle cx="34" cy="36" r="6" fill={c.belly} stroke="none" />
        <circle cx="102" cy="36" r="6" fill={c.belly} stroke="none" />
      </g>
    );
  if (concept === 'bunny')
    return (
      <g stroke={c.stroke} strokeWidth="3.5" strokeLinejoin="round">
        <ellipse cx="50" cy="22" rx="9" ry="24" fill={c.body} transform="rotate(-10 50 22)" />
        <ellipse cx="86" cy="22" rx="9" ry="24" fill={c.body} transform="rotate(10 86 22)" />
        <ellipse cx="50" cy="24" rx="4" ry="15" fill={c.earInner} stroke="none" transform="rotate(-10 50 24)" />
        <ellipse cx="86" cy="24" rx="4" ry="15" fill={c.earInner} stroke="none" transform="rotate(10 86 24)" />
      </g>
    );
  if (concept === 'monster')
    return (
      <g strokeLinecap="round">
        <path d="M44 32 L40 8" stroke={c.stroke} strokeWidth="4" fill="none" />
        <path d="M92 32 L96 8" stroke={c.stroke} strokeWidth="4" fill="none" />
        <circle cx="40" cy="7" r="6" fill={c.antenna} stroke={c.stroke} strokeWidth="2.5" />
        <circle cx="96" cy="7" r="6" fill={c.antenna} stroke={c.stroke} strokeWidth="2.5" />
      </g>
    );
  // owl ear tufts (default)
  return (
    <g fill={c.body2} stroke={c.stroke} strokeWidth="3" strokeLinejoin="round">
      <path d="M40 34 L34 12 L54 26Z" />
      <path d="M96 34 L102 12 L82 26Z" />
    </g>
  );
}

function Arm({ c, side, pose }) {
  const flipX = side === 'l';
  let d;
  if (pose === 'up') d = 'M0 0 q-22 -6 -26 -30 q14 6 26 18Z';
  else if (pose === 'point') d = 'M0 0 q26 -2 40 -2 q-14 8 -40 14Z';
  else d = 'M0 0 q22 6 24 26 q-14 -4 -24 -12Z';
  const tx = side === 'l' ? 34 : 102;
  return (
    <g transform={`translate(${tx} 86) ${flipX ? 'scale(-1,1)' : ''}`}>
      <path d={d} fill={c.body} stroke={c.stroke} strokeWidth="3" strokeLinejoin="round" />
    </g>
  );
}

export function Mascot({ concept = 'pip', state = 'idle', size = 120, flip = false, decorative = true }) {
  const c = PALETTE[concept] || PALETTE.pip;
  const lean = state === 'encourage' ? 6 : 0;
  const leftPose = state === 'cheer' ? 'up' : (state === 'encourage' ? 'up' : 'rest');
  const rightPose = state === 'cheer' ? 'up' : (state === 'point' ? 'point' : 'rest');
  const aria = decorative ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': `Pip the guide, ${state}` };
  return (
    <svg
      data-testid="mascot"
      viewBox="0 0 136 150" width={size} height={size * 150 / 136}
      style={{ transform: flip ? 'scaleX(-1)' : 'none', overflow: 'visible' }} {...aria}
    >
      <g style={{ transformOrigin: '68px 90px', transform: `rotate(${lean}deg)` }}>
        <g fill={c.foot} stroke={c.stroke} strokeWidth="2.5" strokeLinecap="round">
          <path d="M52 132 v10 M48 146 h12" />
          <path d="M84 132 v10 M80 146 h12" />
        </g>
        <Ornament concept={concept} c={c} />
        <Arm c={c} side="l" pose={leftPose} />
        <Arm c={c} side="r" pose={rightPose} />
        <ellipse cx="68" cy="80" rx="50" ry="52" fill={c.body} stroke={c.stroke} strokeWidth="3.5" />
        <ellipse cx="68" cy="92" rx="30" ry="33" fill={c.belly} />
        <circle cx="34" cy="74" r="8" fill={c.cheek} opacity="0.65" />
        <circle cx="102" cy="74" r="8" fill={c.cheek} opacity="0.65" />
        <Eyes c={c} state={state} />
        {concept === 'owl'
          ? <path d="M68 66 l-7 9 h14Z" fill={c.beak} stroke={c.stroke} strokeWidth="2" strokeLinejoin="round" />
          : (concept === 'fox' || concept === 'bear' || concept === 'monster')
            ? <ellipse cx="68" cy="72" rx={concept === 'bear' ? 7 : 6} ry={concept === 'bear' ? 6 : 5} fill={c.beak} />
            : concept === 'bunny'
              ? <path d="M64 70 h8 l-4 5Z" fill={c.beak} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round" />
              : <path d="M62 70 l6 9 6 -9 q-6 -4 -12 0Z" fill={c.beak} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round" />}
        <Mouth c={c} state={state} />
      </g>
      {state === 'cheer' && (
        <g fill={c.body2}>
          <path d="M14 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" />
          <path d="M118 22 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" />
        </g>
      )}
      {state === 'sleep' && (
        <g fill={c.stroke} fontFamily="var(--font)" fontWeight="800">
          <text x="108" y="40" fontSize="16">z</text>
          <text x="118" y="26" fontSize="22">Z</text>
        </g>
      )}
    </svg>
  );
}
