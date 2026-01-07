import './ProgressBar.css';

function ProgressBar({ total, viewed, mastered }) {
  const viewedPercent = (viewed / total) * 100;
  const masteredPercent = (mastered / total) * 100;

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <span className="stat viewed">
          👁️ Viewed: {viewed}/{total}
        </span>
        <span className="stat mastered">
          ⭐ Mastered: {mastered}/{total}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill viewed-fill"
          style={{ width: `${viewedPercent}%` }}
        />
        <div
          className="progress-fill mastered-fill"
          style={{ width: `${masteredPercent}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
