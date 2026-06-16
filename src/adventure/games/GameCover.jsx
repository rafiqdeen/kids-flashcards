// GameCover.jsx — illustrated scene covers per game (gradient sky + ground +
// in-scene Pip + game objects), matching the storybook cover style. Ported
// verbatim from adventure-covers.jsx (was window.GameCover).

// little drawn Pip
const Pip = ({ cx, cy, s = 1, extra = null, flip = false }) => (
  <g transform={`translate(${cx} ${cy}) scale(${flip ? -s : s} ${s})`}>
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
const star = (cx, cy, r, fill = '#ffd84d', stroke = '#fff') =>
  <path d={`M${cx} ${cy - r} L${cx + r * 0.28} ${cy - r * 0.3} L${cx + r} ${cy - r * 0.3} L${cx + r * 0.45} ${cy + r * 0.2} L${cx + r * 0.6} ${cy + r} L${cx} ${cy + r * 0.45} L${cx - r * 0.6} ${cy + r} L${cx - r * 0.45} ${cy + r * 0.2} L${cx - r} ${cy - r * 0.3} L${cx - r * 0.28} ${cy - r * 0.3}Z`} fill={fill} stroke={stroke} strokeWidth="0.6" strokeLinejoin="round" />;

// scene shell: gradient sky + optional two-tone ground hills
const scene = (key, sky, ground, kids) => (
  <svg viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id={'gc_' + key} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
    <rect width="100" height="76" fill={`url(#gc_${key})`} />
    {ground && <g><path d="M0 56 Q26 47 52 54 T100 52 V76 H0Z" fill={ground[0]} /><path d="M0 64 Q34 58 64 64 T100 62 V76 H0Z" fill={ground[1]} /></g>}
    {kids}
  </svg>
);

const SCENES = {
  shadow: () => scene('shadow', ['#bfeee2', '#e8fbf5'], ['#5fc9a8', '#46b890'], <g>
    <g transform="translate(70 40)"><circle r="9" fill="#9aa6b2" opacity=".65" /><circle cx="-6" cy="-8" r="3.4" fill="#9aa6b2" opacity=".65" /><circle cx="6" cy="-8" r="3.4" fill="#9aa6b2" opacity=".65" /></g>
    <Pip cx="30" cy="52" s="1.05" extra={<path d="M7 -4 L17 -10" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  pipsays: () => scene('pipsays', ['#ffc7e3', '#ffe6f3'], ['#ec5fa3', '#d94f91'], <g>
    <g fill="#fff"><circle cx="20" cy="20" r="3.4" /><rect x="22.4" y="9" width="2.4" height="13" /><circle cx="78" cy="16" r="3" /><rect x="80" y="7" width="2.2" height="11" /></g>
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity=".8"><path d="M86 30 q6 6 0 14" /><path d="M91 26 q11 10 0 22" /></g>
    <Pip cx="48" cy="52" s="1.1" extra={<path d="M-7 -3 L-15 -11 M7 -3 L15 -11" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  peek: () => scene('peek', ['#ffd0a8', '#ffe9d4'], null, <g>
    <Pip cx="50" cy="48" s="1.15" />
    <path d="M16 76 V52 q0 -8 8 -8 H76 q8 0 8 8 V76Z" fill="#ff9a4d" stroke="#e0813a" strokeWidth="2" />
    <circle cx="30" cy="58" r="5" fill="#ffb877" /><circle cx="70" cy="60" r="6" fill="#ffb877" />
  </g>),
  jigsaw: () => scene('jigsaw', ['#a9e9f5', '#e0f9fd'], ['#33b9cf', '#1aa6bd'], <g>
    <Pip cx="34" cy="52" s="1.0" extra={<path d="M7 -4 L16 -12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
    <g stroke="#fff" strokeWidth="1.6"><rect x="60" y="20" width="16" height="14" rx="3" fill="#ef4444" transform="rotate(-10 68 27)" /><rect x="74" y="30" width="16" height="14" rx="3" fill="#3b82f6" transform="rotate(8 82 37)" /></g>
  </g>),
  boxes: () => scene('boxes', ['#e7d4be', '#f4ece1'], ['#9c7b5b', '#86684b'], <g>
    {star(50, 18, 7)}
    <g stroke="#5b3f29" strokeWidth="1.6"><path d="M46 60 l4 -16 h12 l4 16Z" fill="#a98763" /><path d="M64 60 l4 -16 h12 l4 16Z" fill="#8d6e51" /></g>
    <Pip cx="26" cy="52" s="1.0" extra={<path d="M7 -3 L15 -9" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  doors: () => scene('doors', ['#cdb2ec', '#efe6fb'], ['#7e57c2', '#6a45ad'], <g>
    <g stroke="#fff" strokeWidth="1.8"><rect x="56" y="22" width="18" height="32" rx="3" fill="#9575cd" /><circle cx="71" cy="38" r="1.8" fill="#fff" /><rect x="76" y="22" width="18" height="32" rx="3" fill="#b39ddb" /><circle cx="79" cy="38" r="1.8" fill="#fff" /></g>
    <Pip cx="30" cy="52" s="1.05" />
  </g>),
  paint: () => scene('paint', ['#ffe0a8', '#fff4df'], ['#f5a623', '#e08e0a'], <g>
    <circle cx="74" cy="20" r="4" fill="#ef4444" /><circle cx="84" cy="30" r="3" fill="#3b82f6" /><circle cx="68" cy="32" r="2.6" fill="#22c55e" />
    <Pip cx="38" cy="52" s="1.05" extra={<g><path d="M8 -2 L18 -8" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" /><rect x="16" y="-12" width="3" height="9" rx="1" transform="rotate(35 17 -8)" fill="#92400e" /></g>} />
  </g>),
  calm: () => scene('calm', ['#42427e', '#2b2b58'], null, <g>
    <path d="M76 12 a11 11 0 1 0 0 22 a8.5 8.5 0 1 1 0 -22z" fill="#fff3c4" />
    {star(18, 16, 3, '#fff', '#fff')}{star(40, 24, 2.4, '#fff', '#fff')}{star(88, 48, 2.6, '#fff', '#fff')}{star(26, 40, 2, '#fff', '#fff')}
    <path d="M0 60 Q30 53 60 59 T100 57 V76 H0Z" fill="#34346a" />
    <Pip cx="44" cy="56" s="1.0" extra={<g fill="#9aa6cc"><text x="9" y="-8" fontSize="7" fontFamily="var(--font)" fontWeight="800">z</text><text x="13" y="-13" fontSize="9" fontFamily="var(--font)" fontWeight="800">Z</text></g>} />
  </g>),
  bubble: () => scene('bubble', ['#a9ddff', '#e3f4ff'], ['#33a0e0', '#1c8fd6'], <g>
    <g stroke="#fff" strokeWidth="1.6"><circle cx="72" cy="22" r="10" fill="#7dd3fc" opacity=".85" /><circle cx="86" cy="38" r="6" fill="#bae6fd" opacity=".85" /></g>
    <ellipse cx="68" cy="18" rx="3" ry="2" fill="#fff" opacity=".7" />
    <Pip cx="32" cy="50" s="1.05" extra={<path d="M-7 -3 L-15 -10 M7 -3 L15 -10" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  memory: () => scene('memory', ['#cdb0ee', '#efe6fb'], ['#a560e8', '#9148d6'], <g>
    <g stroke="#fff" strokeWidth="1.6"><rect x="58" y="24" width="16" height="22" rx="3" fill="#fff" transform="rotate(-8 66 35)" />{star(66, 33, 5, '#a560e8', '#a560e8')}<rect x="76" y="26" width="16" height="22" rx="3" fill="#7e3fc0" transform="rotate(7 84 37)" /></g>
    <Pip cx="30" cy="52" s="1.0" />
  </g>),
  trace: () => scene('trace', ['#cbeeb0', '#eefae3'], ['#5fb83f', '#4ca330'], <g>
    <path d="M58 44 Q70 22 84 38" fill="none" stroke="#fff" strokeWidth="2.4" strokeDasharray="1 5" strokeLinecap="round" />
    <Pip cx="34" cy="52" s="1.0" extra={<g transform="rotate(40 16 -8)"><rect x="13" y="-16" width="4" height="12" rx="1.5" fill="#ffca3a" stroke="#e0a800" strokeWidth="1" /><path d="M13 -4 h4 l-2 4Z" fill="#92400e" /></g>} />
  </g>),
  sort: () => scene('sort', ['#ffd9a8', '#fff1de'], ['#ff9600', '#e88600'], <g>
    <g transform="translate(74 42)"><circle r="13" fill="#7c4dff" /><circle cx="-5" cy="-4" r="3.4" fill="#fff" /><circle cx="5" cy="-4" r="3.4" fill="#fff" /><circle cx="-5" cy="-3.4" r="1.6" fill="#2d3142" /><circle cx="5" cy="-3.4" r="1.6" fill="#2d3142" /><path d="M-5 4 q5 6 10 0Z" fill="#2d1a4d" /></g>
    <circle cx="52" cy="30" r="3.4" fill="#ef4444" /><circle cx="58" cy="22" r="3" fill="#22c55e" />
    <Pip cx="28" cy="52" s="1.0" extra={<path d="M8 -3 L17 -9" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  train: () => scene('train', ['#ffc0c0', '#ffe6e6'], ['#ef4444', '#d93636'], <g>
    <g stroke="#b91c1c" strokeWidth="1.6"><rect x="40" y="34" width="34" height="20" rx="5" fill="#ef4444" /><rect x="74" y="40" width="16" height="14" rx="3" fill="#f97316" /><rect x="46" y="38" width="11" height="9" rx="2" fill="#bae6fd" stroke="none" /><circle cx="50" cy="58" r="5" fill="#334155" stroke="none" /><circle cx="68" cy="58" r="5" fill="#334155" stroke="none" /><circle cx="83" cy="58" r="4" fill="#334155" stroke="none" /></g>
    <Pip cx="22" cy="50" s="0.92" />
  </g>),
  cube: () => scene('cube', ['#bcc4ff', '#e8ebff'], ['#5b63d6', '#474fc0'], <g>
    <g stroke="#3730a3" strokeWidth="1.6" strokeLinejoin="round" transform="translate(72 34)"><path d="M0 -14 L14 -7 L0 0 L-14 -7Z" fill="#a5b4fc" /><path d="M-14 -7 L0 0 L0 14 L-14 7Z" fill="#6366f1" /><path d="M14 -7 L0 0 L0 14 L14 7Z" fill="#4f46e5" /></g>
    <Pip cx="30" cy="52" s="1.0" />
  </g>),
  egg: () => scene('egg', ['#e6c0f0', '#f7ecfb'], ['#b25fd0', '#9d4bbd'], <g>
    {star(74, 16, 6)}
    <g transform="translate(72 40)"><path d="M-12 16 a12 15 0 0 1 24 0Z" fill="#fff" stroke="#cbb6d8" strokeWidth="1.6" /><path d="M-13 16 q13 -8 26 0" fill="#fff" stroke="#cbb6d8" strokeWidth="1.6" /><path d="M-10 16 l3 -4 3 4 3 -4 3 4 3 -4 2 4" fill="none" stroke="#cbb6d8" strokeWidth="1.4" strokeLinejoin="round" /></g>
    <Pip cx="28" cy="52" s="1.0" extra={<path d="M8 -3 L16 -9" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  wheel: () => scene('wheel', ['#ffbcd6', '#ffe6f0'], ['#f06292', '#dd5081'], <g>
    <g stroke="#fff" strokeWidth="1.4" transform="translate(72 34)"><circle r="14" fill="#f06292" /><path d="M0 0 L0 -14 A14 14 0 0 1 12 -7Z" fill="#ffca3a" /><path d="M0 0 L12 7 A14 14 0 0 1 -12 7Z" fill="#4ec0f0" /><path d="M0 0 L-12 -7 A14 14 0 0 1 0 -14Z" fill="#7ed957" /><circle r="2.6" fill="#fff" /></g>
    <path d="M72 16 l4 7 h-8Z" fill="#2d3142" transform="translate(0 -2)" />
    <Pip cx="28" cy="52" s="1.0" extra={<path d="M8 -3 L16 -9" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  unfold: () => scene('unfold', ['#ffdca0', '#fff4e0'], ['#ffa726', '#f0950f'], <g>
    <g stroke="#e0a800" strokeWidth="1.6" strokeLinejoin="round" transform="translate(72 34)"><path d="M0 -14 L14 0 L0 8 L-14 0Z" fill="#ffca3a" /><path d="M0 -14 L0 8 L-14 0Z" fill="#ffd966" /><path d="M-8 -4 L0 8 L8 -4" fill="none" stroke="#fff" strokeWidth="1.2" /></g>
    <Pip cx="30" cy="52" s="1.0" />
  </g>),
  stack: () => scene('stack', ['#bcecc0', '#eefaef'], ['#43b15a', '#379049'], <g>
    <g stroke="#fff" strokeWidth="1.6" transform="translate(70 0)"><rect x="-14" y="42" width="28" height="11" rx="2.5" fill="#22c55e" /><rect x="-10" y="31" width="20" height="11" rx="2.5" fill="#4ade80" /><rect x="-6" y="20" width="12" height="11" rx="2.5" fill="#86efac" /></g>
    {star(70, 12, 5)}
    <Pip cx="28" cy="52" s="1.0" extra={<path d="M8 -3 L16 -9" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  tunnel: () => scene('tunnel', ['#a8e9f4', '#e3f8fc'], ['#22b8cf', '#149fb5'], <g>
    <g fill="none"><ellipse cx="70" cy="38" rx="22" ry="17" stroke="#0e8aa0" strokeWidth="3" opacity=".5" /><ellipse cx="70" cy="38" rx="15" ry="12" stroke="#26c6da" strokeWidth="3" /><ellipse cx="70" cy="38" rx="8" ry="6.5" stroke="#80deea" strokeWidth="3" /></g>
    <Pip cx="30" cy="52" s="1.0" extra={<path d="M8 -3 L16 -9" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  fountain: () => scene('fountain', ['#cdb6ef', '#efe6fb'], ['#9575cd', '#7e5cbd'], <g>
    <g stroke="#fff" strokeWidth="1.5"><rect x="40" y="26" width="13" height="18" rx="2.5" fill="#b39ddb" transform="rotate(-24 46 35)" /><rect x="55" y="22" width="13" height="18" rx="2.5" fill="#fff" transform="rotate(0 61 31)" /><rect x="70" y="26" width="13" height="18" rx="2.5" fill="#b39ddb" transform="rotate(24 76 35)" /></g>
    {star(62, 12, 5)}
    <Pip cx="26" cy="52" s="0.95" extra={<path d="M-7 -3 L-14 -10 M7 -3 L14 -10" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
  balloon: () => scene('balloon', ['#ffc0c0', '#ffe8e8'], ['#ef5350', '#d93f3c'], <g>
    <g transform="translate(70 26)"><path d="M0 -14 a11 13 0 1 0 -.1 0Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.4" /><path d="M0 -1 q3 8 0 18" fill="none" stroke="#9ca3af" strokeWidth="1.2" /></g>
    <Pip cx="32" cy="52" s="1.0" extra={<path d="M8 -4 L20 -12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />} />
  </g>),
};

export function GameCover({ id }) {
  const fn = SCENES[id];
  if (fn) return fn();
  return scene('fallback', ['#cfe0f0', '#eef4fb'], ['#9bb4cc', '#88a3bd'], <g>{star(70, 30, 9)}<Pip cx="32" cy="52" s="1.0" /></g>);
}
