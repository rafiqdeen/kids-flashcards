// data.jsx — categories, sample cards, and a drawn-illustration library.
// All art is chunky, rounded, thick-stroked SVG to match the kid-friendly bar.
(function () {
  const S = '#3a2a1d';   // friendly dark stroke
  const sw = 3.4;

  // ---- Illustration library. Each returns inline SVG content sized to 100x100 viewBox. ----
  function Illu({ name, hex, char, size = 84 }) {
    const wrap = (kids) => (
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true"
           style={{ overflow: 'visible', display: 'block' }}>{kids}</svg>
    );
    const st = { stroke: S, strokeWidth: sw, strokeLinejoin: 'round', strokeLinecap: 'round' };
    // soft grounding shadow under standing objects
    const ground = (cx, rx) => <ellipse cx={cx} cy="90" rx={rx} ry="6" fill="#5b3a1a" opacity="0.16" />;
    const blush = (x) => <circle cx={x} cy="62" r="6" fill="#fb7185" opacity="0.45" />;
    switch (name) {
      case 'letter': return wrap(<g><text x="51" y="51" dy=".35em" textAnchor="middle" fontFamily="var(--font)" fontWeight="800" fontSize="74" fill="#000" opacity="0.12">{char}</text><text x="50" y="50" dy=".35em" textAnchor="middle" fontFamily="var(--font)" fontWeight="800" fontSize="74" fill="currentColor">{char}</text></g>);
      case 'number': return wrap(<g><text x="51" y="51" dy=".35em" textAnchor="middle" fontFamily="var(--font)" fontWeight="800" fontSize="74" fill="#000" opacity="0.12">{char}</text><text x="50" y="50" dy=".35em" textAnchor="middle" fontFamily="var(--font)" fontWeight="800" fontSize="74" fill="currentColor">{char}</text></g>);
      case 'swatch': { const gid = 'g_sw_' + String(hex || '000').replace('#', ''); return wrap(<g><defs><radialGradient id={gid} cx="38%" cy="32%" r="75%"><stop offset="0%" stopColor="#fff" stopOpacity="0.7" /><stop offset="45%" stopColor={hex} /><stop offset="100%" stopColor="#000" stopOpacity="0.18" /></radialGradient></defs><circle cx="50" cy="50" r="34" fill={hex} /><circle cx="50" cy="50" r="34" fill={`url(#${gid})`} /><ellipse cx="40" cy="38" rx="10" ry="6" fill="#fff" opacity="0.55" /></g>); }
      case 'circle': return wrap(<g><defs><radialGradient id="g_ci" cx="38%" cy="32%" r="78%"><stop offset="0%" stopColor="#fff" stopOpacity="0.55" /><stop offset="45%" stopColor="currentColor" /><stop offset="100%" stopColor="#000" stopOpacity="0.2" /></radialGradient></defs><circle cx="50" cy="50" r="34" fill="currentColor" /><circle cx="50" cy="50" r="34" fill="url(#g_ci)" stroke="#000" strokeOpacity="0.12" strokeWidth="2" /></g>);
      case 'square': return wrap(<g><defs><linearGradient id="g_sq" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0.45" /><stop offset="40%" stopColor="currentColor" /><stop offset="100%" stopColor="#000" stopOpacity="0.2" /></linearGradient></defs><rect x="18" y="18" width="64" height="64" rx="14" fill="currentColor" /><rect x="18" y="18" width="64" height="64" rx="14" fill="url(#g_sq)" /></g>);
      case 'triangle': return wrap(<g><defs><linearGradient id="g_tr" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0.45" /><stop offset="45%" stopColor="currentColor" /><stop offset="100%" stopColor="#000" stopOpacity="0.2" /></linearGradient></defs><path d="M50 16 L84 80 H16Z" fill="currentColor" {...st} strokeOpacity="0" /><path d="M50 16 L84 80 H16Z" fill="url(#g_tr)" strokeLinejoin="round" /></g>);
      case 'star': return wrap(<g><defs><radialGradient id="g_st" cx="42%" cy="34%" r="72%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="45%" stopColor="currentColor" /><stop offset="100%" stopColor="#000" stopOpacity="0.18" /></radialGradient></defs><path d="M50 14 l10 24 26 2 -20 17 7 25 -23 -14 -23 14 7 -25 -20 -17 26 -2Z" fill="currentColor" strokeLinejoin="round" /><path d="M50 14 l10 24 26 2 -20 17 7 25 -23 -14 -23 14 7 -25 -20 -17 26 -2Z" fill="url(#g_st)" /></g>);
      case 'heart': return wrap(<g><defs><radialGradient id="g_he" cx="40%" cy="32%" r="75%"><stop offset="0%" stopColor="#fff" stopOpacity="0.55" /><stop offset="45%" stopColor="currentColor" /><stop offset="100%" stopColor="#000" stopOpacity="0.2" /></radialGradient></defs><path d="M50 82 C18 60 18 30 38 30 c8 0 12 6 12 6 s4 -6 12 -6 c20 0 20 30 -12 52Z" fill="currentColor" /><path d="M50 82 C18 60 18 30 38 30 c8 0 12 6 12 6 s4 -6 12 -6 c20 0 20 30 -12 52Z" fill="url(#g_he)" /></g>);
      case 'apple': return wrap(<g><defs><radialGradient id="g_ap" cx="38%" cy="30%" r="78%"><stop offset="0%" stopColor="#ff8a8a" /><stop offset="55%" stopColor="#ef4444" /><stop offset="100%" stopColor="#b91c1c" /></radialGradient><linearGradient id="g_apl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#22c55e" /></linearGradient></defs>{ground(50, 24)}<path d="M50 28 q3 -12 14 -13" fill="none" stroke="#7c4a2a" strokeWidth="4" strokeLinecap="round" /><path d="M50 30 C30 22 17 41 24 61 c5 18 18 26 26 26 s21 -8 26 -26 c7 -20 -6 -39 -26 -31Z" fill="url(#g_ap)" /><path d="M64 22 q14 -6 16 6 q-12 4 -16 -6Z" fill="url(#g_apl)" stroke="#15803d" strokeWidth="1.5" /><ellipse cx="38" cy="44" rx="9" ry="14" fill="#fff" opacity="0.4" transform="rotate(-20 38 44)" /></g>);
      case 'banana': return wrap(<g><defs><linearGradient id="g_ba" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor="#fde047" /><stop offset="60%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient></defs>{ground(52, 26)}<path d="M22 40 q6 40 46 44 q14 1 14 -7 q-30 0 -44 -40 q-3 -8 -16 3Z" fill="url(#g_ba)" stroke="#b45309" strokeWidth="2.5" strokeLinejoin="round" /><path d="M24 42 q8 34 42 40" fill="none" stroke="#fff" strokeWidth="3" strokeOpacity="0.4" strokeLinecap="round" /><path d="M78 80 l5 4" stroke="#7c4a16" strokeWidth="4" strokeLinecap="round" /></g>);
      case 'carrot': return wrap(<g><defs><linearGradient id="g_ca" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fdba74" /><stop offset="55%" stopColor="#f97316" /><stop offset="100%" stopColor="#c2410c" /></linearGradient></defs>{ground(48, 20)}<path d="M40 30 L70 78 q-20 12 -38 -4Z" fill="url(#g_ca)" stroke="#9a3412" strokeWidth="2.5" strokeLinejoin="round" /><g stroke="#fff" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round"><path d="M46 40 l6 9 M40 48 l6 9 M36 56 l6 8" /></g><g strokeLinecap="round"><path d="M44 30 L34 12" stroke="#16a34a" strokeWidth="6" /><path d="M52 28 L54 8" stroke="#22c55e" strokeWidth="6" /><path d="M58 32 L72 16" stroke="#16a34a" strokeWidth="6" /></g></g>);
      case 'broccoli': return wrap(<g><defs><radialGradient id="g_br" cx="45%" cy="35%" r="70%"><stop offset="0%" stopColor="#86efac" /><stop offset="60%" stopColor="#22c55e" /><stop offset="100%" stopColor="#15803d" /></radialGradient></defs>{ground(50, 22)}<path d="M43 48 h14 v32 q-7 4 -14 0Z" fill="#65a30d" stroke="#3f6212" strokeWidth="2.5" strokeLinejoin="round" /><g fill="url(#g_br)" stroke="#15803d" strokeWidth="2.5"><circle cx="36" cy="40" r="15" /><circle cx="64" cy="40" r="15" /><circle cx="50" cy="29" r="16" /></g></g>);
      case 'cat': return wrap(<g><defs><radialGradient id="g_cf" cx="40%" cy="32%" r="75%"><stop offset="0%" stopColor="#fdba74" /><stop offset="60%" stopColor="#fb923c" /><stop offset="100%" stopColor="#ea7c1f" /></radialGradient></defs><path d="M28 36 L24 12 L46 28Z M72 36 L76 12 L54 28Z" fill="url(#g_cf)" stroke="#c2691a" strokeWidth="2.5" strokeLinejoin="round" /><path d="M30 32 L28 20 L40 28Z M70 32 L72 20 L60 28Z" fill="#f9a8d4" opacity="0.8" /><circle cx="50" cy="56" r="30" fill="url(#g_cf)" stroke="#c2691a" strokeWidth="2.5" /><ellipse cx="50" cy="50" rx="22" ry="18" fill="#fdd9b5" opacity="0.55" /><ellipse cx="40" cy="53" rx="5.5" ry="7" fill={S} /><ellipse cx="60" cy="53" rx="5.5" ry="7" fill={S} /><circle cx="42" cy="50" r="2" fill="#fff" /><circle cx="62" cy="50" r="2" fill="#fff" />{blush(36)}{blush(64)}<path d="M50 60 l-4 4 4 2.5 4 -2.5Z" fill="#9d3b2e" /><path d="M50 66 q-5 5 -10 3 M50 66 q5 5 10 3" fill="none" stroke={S} strokeWidth="2" strokeLinecap="round" /></g>);
      case 'dog': return wrap(<g><defs><radialGradient id="g_dg" cx="42%" cy="32%" r="72%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="60%" stopColor="#d97706" /><stop offset="100%" stopColor="#a16207" /></radialGradient></defs><ellipse cx="26" cy="50" rx="12" ry="19" fill="#a16207" stroke="#7c4a16" strokeWidth="2.5" /><ellipse cx="74" cy="50" rx="12" ry="19" fill="#a16207" stroke="#7c4a16" strokeWidth="2.5" /><circle cx="50" cy="56" r="29" fill="url(#g_dg)" stroke="#7c4a16" strokeWidth="2.5" /><ellipse cx="50" cy="52" rx="20" ry="15" fill="#fde68a" opacity="0.5" /><circle cx="40" cy="52" r="4.5" fill={S} /><circle cx="60" cy="52" r="4.5" fill={S} /><circle cx="41.5" cy="50.5" r="1.6" fill="#fff" /><circle cx="61.5" cy="50.5" r="1.6" fill="#fff" />{blush(36)}{blush(64)}<ellipse cx="50" cy="64" rx="7" ry="5" fill={S} /><path d="M50 69 q-6 5 -11 2 M50 69 q6 5 11 2" fill="none" stroke={S} strokeWidth="2" strokeLinecap="round" /></g>);
      case 'lion': return wrap(<g><defs><radialGradient id="g_lm" cx="50%" cy="48%" r="55%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></radialGradient><radialGradient id="g_lf" cx="42%" cy="34%" r="72%"><stop offset="0%" stopColor="#fef3c7" /><stop offset="60%" stopColor="#fcd34d" /><stop offset="100%" stopColor="#f59e0b" /></radialGradient></defs><g fill="url(#g_lm)">{Array.from({length:11}).map((_,i)=><circle key={i} cx={50+35*Math.cos(i/11*6.28)} cy={52+35*Math.sin(i/11*6.28)} r="12" stroke="#b45309" strokeWidth="2.5" />)}</g><circle cx="50" cy="52" r="27" fill="url(#g_lf)" stroke="#b45309" strokeWidth="2.5" /><circle cx="41" cy="49" r="4" fill={S} /><circle cx="59" cy="49" r="4" fill={S} />{blush(38)}{blush(62)}<path d="M50 55 l-4 4 4 2.5 4 -2.5Z" fill="#9a3412" /><path d="M50 62 q-5 4 -9 2 M50 62 q5 4 9 2" fill="none" stroke={S} strokeWidth="2" strokeLinecap="round" /></g>);
      case 'elephant': return wrap(<g><defs><radialGradient id="g_el" cx="42%" cy="34%" r="74%"><stop offset="0%" stopColor="#cbd5e1" /><stop offset="60%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#64748b" /></radialGradient></defs>{ground(50, 24)}<circle cx="46" cy="48" r="31" fill="url(#g_el)" stroke="#64748b" strokeWidth="2.5" /><path d="M40 62 q-5 24 11 24 q9 0 6 -11" fill="url(#g_el)" stroke="#64748b" strokeWidth="2.5" /><ellipse cx="40" cy="40" rx="14" ry="11" fill="#fff" opacity="0.35" /><circle cx="38" cy="44" r="3.8" fill={S} /><circle cx="39" cy="43" r="1.3" fill="#fff" />{blush(30)}<path d="M70 36 q20 -3 19 16" fill="url(#g_el)" stroke="#64748b" strokeWidth="2.5" /></g>);
      case 'frog': return wrap(<g><defs><radialGradient id="g_fr" cx="45%" cy="35%" r="70%"><stop offset="0%" stopColor="#86efac" /><stop offset="60%" stopColor="#22c55e" /><stop offset="100%" stopColor="#15803d" /></radialGradient></defs>{ground(50, 24)}<circle cx="34" cy="32" r="13" fill="url(#g_fr)" stroke="#15803d" strokeWidth="2.5" /><circle cx="66" cy="32" r="13" fill="url(#g_fr)" stroke="#15803d" strokeWidth="2.5" /><circle cx="34" cy="32" r="5" fill={S} /><circle cx="66" cy="32" r="5" fill={S} /><circle cx="36" cy="30" r="1.6" fill="#fff" /><circle cx="68" cy="30" r="1.6" fill="#fff" /><path d="M22 50 a28 22 0 0 0 56 0Z" fill="url(#g_fr)" stroke="#15803d" strokeWidth="2.5" />{blush(32)}{blush(68)}<path d="M34 64 q16 10 32 0" fill="none" stroke={S} strokeWidth="2.5" strokeLinecap="round" /></g>);
      case 'fish': return wrap(<g><defs><radialGradient id="g_fi" cx="40%" cy="35%" r="75%"><stop offset="0%" stopColor="#7dd3fc" /><stop offset="60%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#0369a1" /></radialGradient></defs><path d="M68 50 L92 34 q4 16 0 32Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" strokeLinejoin="round" /><ellipse cx="44" cy="50" rx="33" ry="23" fill="url(#g_fi)" stroke="#0369a1" strokeWidth="2.5" /><path d="M50 40 q-10 10 0 20" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.4" /><circle cx="32" cy="46" r="6" fill="#fff" /><circle cx="31" cy="46" r="3" fill={S} />{blush(36)}<path d="M22 52 q6 4 12 0" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" /></g>);
      case 'bee': return wrap(<g><defs><radialGradient id="g_be" cx="42%" cy="32%" r="72%"><stop offset="0%" stopColor="#fde047" /><stop offset="60%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></radialGradient></defs><ellipse cx="34" cy="38" rx="15" ry="10" fill="#fff" opacity="0.9" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-20 34 38)" /><ellipse cx="66" cy="38" rx="15" ry="10" fill="#fff" opacity="0.9" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(20 66 38)" /><ellipse cx="50" cy="55" rx="27" ry="21" fill="url(#g_be)" stroke="#b45309" strokeWidth="2.5" /><g stroke="#3a2a1d" strokeWidth="5"><path d="M44 36 v38 M57 37 v36" /></g><circle cx="44" cy="51" r="3" fill={S} /><circle cx="56" cy="51" r="3" fill={S} />{blush(40)}<path d="M46 60 q6 4 10 0" fill="none" stroke="#7c4a16" strokeWidth="2" strokeLinecap="round" /></g>);
      case 'parrot': return wrap(<g><defs><linearGradient id="g_pa" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#16a34a" /></linearGradient></defs><path d="M40 28 q28 -8 32 24 q4 32 -24 36 q-26 4 -24 -28 q2 -24 16 -32Z" fill="url(#g_pa)" stroke="#15803d" strokeWidth="2.5" strokeLinejoin="round" /><path d="M40 44 q-15 0 -10 17" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" /><circle cx="52" cy="42" r="5" fill="#fff" /><circle cx="52" cy="42" r="2.6" fill={S} /><path d="M62 48 q13 2 11 13 q-11 2 -13 -8Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />{blush(46)}</g>);
      case 'car': return wrap(<g><defs><linearGradient id="g_cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb7185" /><stop offset="100%" stopColor="#dc2626" /></linearGradient><linearGradient id="g_cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e0f2fe" /><stop offset="100%" stopColor="#7dd3fc" /></linearGradient></defs>{ground(50, 34)}<path d="M12 62 q0 -4 4 -4 h6 L32 44 q2 -3 6 -3 h26 q4 0 6 3 l8 14 h6 q4 0 4 4 v6 h-72Z" fill="url(#g_cb)" stroke="#a51d2d" strokeWidth="2.5" strokeLinejoin="round" /><path d="M36 44 h12 v13 H32Z M52 44 h12 l6 13 H52Z" fill="url(#g_cw)" stroke="#a51d2d" strokeWidth="1.5" /><rect x="14" y="58" width="70" height="3.5" fill="#fff" opacity="0.25" /><circle cx="32" cy="68" r="10" fill="#27272a" /><circle cx="32" cy="68" r="4.5" fill="#a1a1aa" /><circle cx="68" cy="68" r="10" fill="#27272a" /><circle cx="68" cy="68" r="4.5" fill="#a1a1aa" /><circle cx="82" cy="57" r="3" fill="#fde68a" /></g>);
      case 'bus': return wrap(<g><defs><linearGradient id="g_bu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fcd34d" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs>{ground(50, 34)}<rect x="14" y="26" width="72" height="40" rx="10" fill="url(#g_bu)" stroke="#b45309" strokeWidth="2.5" /><g fill="#bae6fd" stroke="#0369a1" strokeWidth="1.5"><rect x="22" y="34" width="14" height="14" rx="3" /><rect x="43" y="34" width="14" height="14" rx="3" /><rect x="64" y="34" width="12" height="14" rx="3" /></g><rect x="16" y="56" width="68" height="3" fill="#fff" opacity="0.3" /><circle cx="32" cy="70" r="9" fill="#27272a" /><circle cx="32" cy="70" r="4" fill="#a1a1aa" /><circle cx="68" cy="70" r="9" fill="#27272a" /><circle cx="68" cy="70" r="4" fill="#a1a1aa" /></g>);
      case 'sun': return wrap(<g><defs><radialGradient id="g_sc" cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor="#fff3c4" /><stop offset="55%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></radialGradient><radialGradient id="g_sg" cx="50%" cy="50%" r="50%"><stop offset="55%" stopColor="#fcd34d" stopOpacity="0.5" /><stop offset="100%" stopColor="#fcd34d" stopOpacity="0" /></radialGradient></defs><circle cx="50" cy="50" r="46" fill="url(#g_sg)" /><g strokeLinecap="round">{Array.from({length:12}).map((_,i)=>{const a=i/12*6.28;return <path key={i} d={`M${50+26*Math.cos(a)} ${50+26*Math.sin(a)} L${50+42*Math.cos(a)} ${50+42*Math.sin(a)}`} stroke="#f59e0b" strokeWidth={i%2?4:6} />;})}</g><circle cx="50" cy="50" r="24" fill="url(#g_sc)" /><ellipse cx="42" cy="42" rx="8" ry="6" fill="#fff" opacity="0.35" /><circle cx="43" cy="49" r="2.6" fill="#9a6a00" /><circle cx="57" cy="49" r="2.6" fill="#9a6a00" />{blush(38)}{blush(62)}<path d="M43 56 q7 7 14 0" fill="none" stroke="#9a6a00" strokeWidth="3" strokeLinecap="round" /></g>);
      case 'cloud': return wrap(<g><defs><linearGradient id="g_cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#bae6fd" /></linearGradient></defs><g fill="url(#g_cl)" stroke="#7dd3fc" strokeWidth="2.5" strokeLinejoin="round"><path d="M28 66 a16 16 0 0 1 2 -31 a20 20 0 0 1 38 -2 a14 14 0 0 1 4 33Z" /></g><ellipse cx="40" cy="44" rx="10" ry="5" fill="#fff" opacity="0.7" /></g>);
      case 'rainbow': return wrap(<g><g fill="none" strokeWidth="7" strokeLinecap="round"><path d="M16 74 a34 34 0 0 1 68 0" stroke="#ef4444" /><path d="M25 74 a25 25 0 0 1 50 0" stroke="#f59e0b" /><path d="M34 74 a16 16 0 0 1 32 0" stroke="#22c55e" /><path d="M43 74 a7 7 0 0 1 14 0" stroke="#3b82f6" /></g><g fill="#fff" stroke="#cbd5e1" strokeWidth="2"><ellipse cx="18" cy="78" rx="12" ry="8" /><ellipse cx="82" cy="78" rx="12" ry="8" /></g></g>);
      case 'hand': return wrap(<g><defs><linearGradient id="g_ha" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0%" stopColor="#fde68a" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs><g fill="url(#g_ha)" stroke="#b45309" strokeWidth="2.5" strokeLinejoin="round"><rect x="33" y="38" width="34" height="44" rx="15" /><rect x="33" y="28" width="8" height="22" rx="4" /><rect x="44" y="20" width="8" height="30" rx="4" /><rect x="54" y="22" width="8" height="28" rx="4" /><rect x="63" y="30" width="8" height="20" rx="4" /></g><path d="M40 48 q10 -4 20 0" fill="none" stroke="#fff" strokeWidth="2.5" strokeOpacity="0.5" strokeLinecap="round" /></g>);
      case 'happy': return wrap(<g><defs><radialGradient id="g_hp" cx="42%" cy="34%" r="72%"><stop offset="0%" stopColor="#fef08a" /><stop offset="60%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></radialGradient></defs><circle cx="50" cy="50" r="34" fill="url(#g_hp)" stroke="#d97706" strokeWidth="2.5" /><ellipse cx="42" cy="40" rx="10" ry="7" fill="#fff" opacity="0.3" /><circle cx="40" cy="44" r="4.5" fill={S} /><circle cx="60" cy="44" r="4.5" fill={S} />{blush(34)}{blush(66)}<path d="M36 58 q14 18 28 0" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" /></g>);
      case 'sad': return wrap(<g><defs><radialGradient id="g_sd" cx="42%" cy="34%" r="72%"><stop offset="0%" stopColor="#bfdbfe" /><stop offset="60%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#60a5fa" /></radialGradient></defs><circle cx="50" cy="50" r="34" fill="url(#g_sd)" stroke="#3b82f6" strokeWidth="2.5" /><ellipse cx="42" cy="40" rx="10" ry="7" fill="#fff" opacity="0.3" /><circle cx="40" cy="46" r="4.5" fill={S} /><circle cx="60" cy="46" r="4.5" fill={S} /><path d="M36 66 q14 -14 28 0" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" /><path d="M38 54 q-2 8 2 11 q4 -3 2 -11Z" fill="#38bdf8" /></g>);
      default: return wrap(<g><circle cx="50" cy="50" r="34" fill="currentColor" {...st} opacity="0.9" /><text x="50" y="50" dy=".35em" textAnchor="middle" fontFamily="var(--font)" fontWeight="800" fontSize="34" fill="#fff">{(char||'?')}</text></g>);
    }
  }

  // ---- Categories (all 12). icon = an Illu name. ----
  const CATEGORIES = [
    { id:'alphabet',  name:'Alphabet',   color:'alphabet',  count:26, desc:'A to Z', icon:{name:'letter', char:'A'} },
    { id:'numbers',   name:'Numbers',    color:'numbers',   count:10, desc:'Count 1–10', icon:{name:'number', char:'3'} },
    { id:'animals',   name:'Animals',    color:'animals',   count:46, desc:'Furry friends', icon:{name:'lion'} },
    { id:'fruits',    name:'Fruits',     color:'fruits',    count:18, desc:'Yummy & sweet', icon:{name:'apple'} },
    { id:'vegetables',name:'Vegetables', color:'vegetables',count:20, desc:'Good greens', icon:{name:'carrot'} },
    { id:'birds',     name:'Birds',      color:'birds',     count:21, desc:'They fly!', icon:{name:'parrot'} },
    { id:'colors',    name:'Colors',     color:'colors',    count:9,  desc:'Rainbow', icon:{name:'swatch', hex:'#a855f7'} },
    { id:'shapes',    name:'Shapes',     color:'shapes',    count:15, desc:'Round & flat', icon:{name:'star'} },
    { id:'vehicles',  name:'Vehicles',   color:'vehicles',  count:20, desc:'Go go go', icon:{name:'car'} },
    { id:'body',      name:'Body Parts', color:'body',      count:17, desc:'All about me', icon:{name:'hand'} },
    { id:'weather',   name:'Weather',    color:'weather',   count:22, desc:'Sky watch', icon:{name:'sun'} },
    { id:'emotions',  name:'Emotions',   color:'emotions',  count:25, desc:'How I feel', icon:{name:'happy'} },
  ];

  // ---- Sample card sets (front type varies, back layout consistent) ----
  // front: {kind:'mega'|'illu'|'swatch'|'shape', ...}; back badge label is the one contextual chip.
  const CARDS = {
    animals: [
      { id:'cat', front:{kind:'illu', name:'cat'}, word:'Cat', badge:{label:'Says “Meow”', icon:'sound'}, phrase:'Cat. The cat says meow.' },
      { id:'dog', front:{kind:'illu', name:'dog'}, word:'Dog', badge:{label:'Says “Woof”', icon:'sound'}, phrase:'Dog. The dog says woof.' },
      { id:'lion', front:{kind:'illu', name:'lion'}, word:'Lion', badge:{label:'Says “Roar”', icon:'sound'}, phrase:'Lion. The lion says roar.' },
      { id:'elephant', front:{kind:'illu', name:'elephant'}, word:'Elephant', badge:{label:'Lives: savanna', icon:'home'}, phrase:'Elephant.' },
      { id:'frog', front:{kind:'illu', name:'frog'}, word:'Frog', badge:{label:'Says “Ribbit”', icon:'sound'}, phrase:'Frog. The frog says ribbit.' },
      { id:'fish', front:{kind:'illu', name:'fish'}, word:'Fish', badge:{label:'Lives: water', icon:'home'}, phrase:'Fish.' },
    ],
    alphabet: [
      { id:'a', front:{kind:'mega', text:'A'}, word:'Apple', badge:{label:'A is for Apple', icon:'tag'}, illu:'apple', phrase:'A is for Apple.' },
      { id:'b', front:{kind:'mega', text:'B'}, word:'Bee', badge:{label:'B is for Bee', icon:'tag'}, illu:'bee', phrase:'B is for Bee.' },
      { id:'c', front:{kind:'mega', text:'C'}, word:'Cat', badge:{label:'C is for Cat', icon:'tag'}, illu:'cat', phrase:'C is for Cat.' },
      { id:'d', front:{kind:'mega', text:'D'}, word:'Dog', badge:{label:'D is for Dog', icon:'tag'}, illu:'dog', phrase:'D is for Dog.' },
    ],
    fruits: [
      { id:'apple', front:{kind:'illu', name:'apple'}, word:'Apple', badge:{label:'Crunchy & red', icon:'tag'}, phrase:'Apple.' },
      { id:'banana', front:{kind:'illu', name:'banana'}, word:'Banana', badge:{label:'Soft & yellow', icon:'tag'}, phrase:'Banana.' },
    ],
    vegetables: [
      { id:'carrot', front:{kind:'illu', name:'carrot'}, word:'Carrot', badge:{label:'Orange & crunchy', icon:'tag'}, phrase:'Carrot.' },
      { id:'broccoli', front:{kind:'illu', name:'broccoli'}, word:'Broccoli', badge:{label:'Little green trees', icon:'tag'}, phrase:'Broccoli.' },
    ],
    colors: [
      { id:'red', front:{kind:'swatch', hex:'#ef4444'}, word:'Red', badge:{label:'Like an apple', icon:'tag'}, phrase:'Red.' },
      { id:'blue', front:{kind:'swatch', hex:'#3b82f6'}, word:'Blue', badge:{label:'Like the sky', icon:'tag'}, phrase:'Blue.' },
      { id:'green', front:{kind:'swatch', hex:'#22c55e'}, word:'Green', badge:{label:'Like the grass', icon:'tag'}, phrase:'Green.' },
    ],
    shapes: [
      { id:'circle', front:{kind:'shape', name:'circle'}, word:'Circle', badge:{label:'No corners', icon:'info'}, phrase:'Circle.' },
      { id:'square', front:{kind:'shape', name:'square'}, word:'Square', badge:{label:'4 sides', icon:'info'}, phrase:'Square.' },
      { id:'triangle', front:{kind:'shape', name:'triangle'}, word:'Triangle', badge:{label:'3 sides', icon:'info'}, phrase:'Triangle.' },
      { id:'star', front:{kind:'shape', name:'star'}, word:'Star', badge:{label:'5 points', icon:'info'}, phrase:'Star.' },
    ],
    numbers: [
      { id:'1', front:{kind:'mega', text:'1'}, word:'One', badge:{label:'1 apple', icon:'tag'}, dots:1, phrase:'One.' },
      { id:'2', front:{kind:'mega', text:'2'}, word:'Two', badge:{label:'2 apples', icon:'tag'}, dots:2, phrase:'Two.' },
      { id:'3', front:{kind:'mega', text:'3'}, word:'Three', badge:{label:'3 apples', icon:'tag'}, dots:3, phrase:'Three.' },
    ],
    weather: [
      { id:'sun', front:{kind:'illu', name:'sun'}, word:'Sunny', badge:{label:'Warm & bright', icon:'info'}, phrase:'Sunny.' },
      { id:'cloud', front:{kind:'illu', name:'cloud'}, word:'Cloudy', badge:{label:'Grey sky', icon:'info'}, phrase:'Cloudy.' },
      { id:'rainbow', front:{kind:'illu', name:'rainbow'}, word:'Rainbow', badge:{label:'After rain', icon:'info'}, phrase:'Rainbow.' },
    ],
    emotions: [
      { id:'happy', front:{kind:'illu', name:'happy'}, word:'Happy', badge:{label:'I feel good!', icon:'info'}, phrase:'Happy.' },
      { id:'sad', front:{kind:'illu', name:'sad'}, word:'Sad', badge:{label:'It’s okay to cry', icon:'info'}, phrase:'Sad.' },
    ],
    vehicles: [
      { id:'car', front:{kind:'illu', name:'car'}, word:'Car', badge:{label:'Says “Vroom”', icon:'sound'}, phrase:'Car. Vroom.' },
      { id:'bus', front:{kind:'illu', name:'bus'}, word:'Bus', badge:{label:'Says “Beep”', icon:'sound'}, phrase:'Bus. Beep beep.' },
    ],
    birds: [
      { id:'parrot', front:{kind:'illu', name:'parrot'}, word:'Parrot', badge:{label:'Can talk!', icon:'sound'}, phrase:'Parrot.' },
    ],
    body: [
      { id:'hand', front:{kind:'illu', name:'hand'}, word:'Hand', badge:{label:'I can wave', icon:'info'}, phrase:'Hand.' },
    ],
  };

  // Avatars for onboarding (illustrated)
  const AVATARS = [
    { id:'cat', name:'Kitty', illu:'cat' },
    { id:'dog', name:'Puppy', illu:'dog' },
    { id:'frog', name:'Hoppy', illu:'frog' },
    { id:'fish', name:'Bubbles', illu:'fish' },
  ];

  window.Illu = Illu;
  window.CATEGORIES = CATEGORIES;
  window.CARDS = CARDS;
  window.AVATARS = AVATARS;
})();
