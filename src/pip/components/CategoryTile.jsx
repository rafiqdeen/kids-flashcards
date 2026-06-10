import { Icon } from './Icon.jsx';
import { Illu } from '../art/Illu.jsx';

export function CategoryTile({ cat, progress = 0, done = false, onSelect }) {
  const pct = Math.round(progress * 100);
  return (
    <button
      data-testid={`category-tile-${cat.id}`}
      className="cat-tile"
      onClick={() => onSelect(cat)}
      style={{ '--c1': `var(--cat-${cat.color}-1)`, '--c2': `var(--cat-${cat.color}-2)` }}
      aria-label={`${cat.name}. ${cat.count} cards. ${done ? 'Completed' : pct > 0 ? pct + ' percent done' : 'Start learning'}`}
    >
      <span className="cat-icon"><Illu name={cat.icon.name} char={cat.icon.char} hex={cat.icon.hex} size={62} /></span>
      <span className="cat-name">{cat.name}</span>
      <span className="cat-foot">
        {done
          ? <span className="cat-stars"><Icon name="star" size={18} /><Icon name="star" size={18} /><Icon name="star" size={18} /></span>
          : pct > 0
            ? <span className="cat-ring" style={{ '--p': pct }}><b>{pct}%</b></span>
            : <span className="cat-start">{cat.count} cards</span>}
      </span>
    </button>
  );
}
