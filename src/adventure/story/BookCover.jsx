// BookCover.jsx — illustrated covers for the four Story Land books. Ported
// verbatim from adventure-story.jsx (BookCover + PipMini).

const PipMini = ({ cx, cy, s = 1, extra = null }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    {extra}
    <path d="M-2.5 -11.5 q-2.5 -4 1 -5.2 q-.3 3.2 3.2 4.4z" fill="#f59e0b" />
    <ellipse cx="0" cy="0" rx="10" ry="11" fill="#fbbf24" />
    <ellipse cx="0" cy="2.5" rx="6.4" ry="7" fill="#fde6b4" />
    <circle cx="-3.2" cy="-2.6" r="1.6" fill="#3a2a18" />
    <circle cx="3.2" cy="-2.6" r="1.6" fill="#3a2a18" />
    <circle cx="-3.7" cy="-3.2" r=".55" fill="#fff" />
    <circle cx="2.7" cy="-3.2" r=".55" fill="#fff" />
    <path d="M-2 0.4 h4 l-2 2.3z" fill="#f97316" />
    <circle cx="-6" cy="1.8" r="2" fill="#fda4af" opacity=".75" />
    <circle cx="6" cy="1.8" r="2" fill="#fda4af" opacity=".75" />
    <path d="M-3 10.6 v2.4 M3 10.6 v2.4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
  </g>
);

export function BookCover({ id }) {
  const svg = (kids) => (
    <svg viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{kids}</svg>
  );
  if (id === 'book') return svg(<g>
    <defs><linearGradient id="cv_n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34346e" /><stop offset="1" stopColor="#5a5aa0" /></linearGradient></defs>
    <rect width="100" height="76" fill="url(#cv_n)" />
    {[[14, 12], [30, 24], [62, 10], [90, 30], [22, 40], [74, 40]].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i % 2 ? 1 : 1.5} fill="#fff" opacity=".85" />)}
    <path d="M84 8 a10 10 0 1 0 0 20 a7.5 7.5 0 1 1 0 -20z" fill="#fff3c4" />
    <g transform="translate(48 24)">
      <circle r="11" fill="#ffe27a" opacity=".35" />
      <circle r="6.5" fill="#ffe27a" opacity=".5" />
      <path d="M0 -8 L2.2 -2.4 L8 -2.4 L3.4 1.2 L5 7 L0 3.4 L-5 7 L-3.4 1.2 L-8 -2.4 L-2.2 -2.4Z" fill="#ffd84d" stroke="#fff" strokeWidth=".7" strokeLinejoin="round" />
    </g>
    <path d="M0 60 Q28 50 52 58 T100 56 V76 H0Z" fill="#2c2c5e" />
    <path d="M0 66 Q40 60 70 66 T100 64 V76 H0Z" fill="#24244e" />
    <PipMini cx="30" cy="55" s="1.05" extra={<path d="M6 -6 L20 -16" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>);
  if (id === 'choose') return svg(<g>
    <defs><linearGradient id="cv_d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bdecff" /><stop offset="1" stopColor="#e7f8ff" /></linearGradient></defs>
    <rect width="100" height="76" fill="url(#cv_d)" />
    <g transform="translate(18 16)"><g stroke="#ffd24d" strokeWidth="2.4" strokeLinecap="round">{[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return <line key={i} x1={Math.cos(a) * 9} y1={Math.sin(a) * 9} x2={Math.cos(a) * 14} y2={Math.sin(a) * 14} />; })}</g><circle r="8.5" fill="#ffd84d" /></g>
    <path d="M0 56 Q26 44 50 54 T100 50 V76 H0Z" fill="#7bd66b" />
    <path d="M0 64 Q30 56 60 64 T100 60 V76 H0Z" fill="#5cc456" />
    <path d="M46 76 L42 60 L58 60 L54 76Z" fill="#e8d6a8" />
    <path d="M50 60 L40 50 M50 60 L62 52" stroke="#e8d6a8" strokeWidth="5" strokeLinecap="round" />
    <g transform="translate(72 40)">
      <rect x="-1.6" y="0" width="3.2" height="20" fill="#9a6a3a" />
      <path d="M2 2 H17 L21 6 L17 10 H2Z" fill="#ff8a5b" stroke="#fff" strokeWidth="1" />
      <path d="M-2 12 H-17 L-21 16 L-17 20 H-2Z" fill="#5cc4f0" stroke="#fff" strokeWidth="1" />
    </g>
    <PipMini cx="40" cy="60" s="1.05" />
  </g>);
  if (id === 'quest') return svg(<g>
    <defs><linearGradient id="cv_q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe1a8" /><stop offset="1" stopColor="#fff3da" /></linearGradient></defs>
    <rect width="100" height="76" fill="url(#cv_q)" />
    <circle cx="80" cy="16" r="9" fill="#ffd84d" />
    <g fill="none" strokeWidth="4" strokeLinecap="round">
      <path d="M8 70 A42 42 0 0 1 92 70" stroke="#ff6b6b" />
      <path d="M15 70 A35 35 0 0 1 85 70" stroke="#ffa24d" />
      <path d="M22 70 A28 28 0 0 1 78 70" stroke="#ffd84d" />
      <path d="M29 70 A21 21 0 0 1 71 70" stroke="#6bd66b" />
      <path d="M36 70 A14 14 0 0 1 64 70" stroke="#5cc4f0" />
    </g>
    <path d="M18 76 L46 30 L62 54 L72 40 L92 76Z" fill="#8d6e63" />
    <path d="M40 38 L46 30 L53 42 L46 46Z" fill="#fff" />
    <path d="M64 49 L72 40 L80 52 L72 55Z" fill="#fff" />
    <PipMini cx="30" cy="64" s=".92" />
  </g>);
  // comic — hero
  return svg(<g>
    <defs><radialGradient id="cv_h" cx="50%" cy="42%" r="70%"><stop offset="0" stopColor="#ff8a5b" /><stop offset="1" stopColor="#e23b3b" /></radialGradient></defs>
    <rect width="100" height="76" fill="url(#cv_h)" />
    <g opacity=".5">{[...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return <path key={i} d={`M50 38 L${50 + Math.cos(a) * 70} ${38 + Math.sin(a) * 70} L${50 + Math.cos(a + 0.26) * 70} ${38 + Math.sin(a + 0.26) * 70}Z`} fill={i % 2 ? '#ffd84d' : '#ffb24d'} />; })}</g>
    <g transform="translate(50 40)">
      <path d="M-9 -4 Q-22 14 -7 18 L-2 8Z" fill="#1d4ed8" />
      <path d="M9 -4 Q22 14 7 18 L2 8Z" fill="#1d4ed8" />
    </g>
    <PipMini cx="50" cy="40" s="1.25" extra={<g>
      <path d="M-9 -3 Q0 -7 9 -3 L8 1 Q0 -2 -8 1Z" fill="#1d4ed8" />
      <path d="M11 -10 q8 -3 9 4 q-5 -2 -9 0z" fill="#ffd84d" stroke="#e09b00" strokeWidth=".6" />
    </g>} />
    <circle cx="74" cy="18" r="3" fill="#fff" opacity=".9" />
    <circle cx="22" cy="22" r="2" fill="#fff" opacity=".8" />
  </g>);
}
