import { Link } from 'react-router-dom';

export default function PitchCard({ pitch }) {
  // Safe fallback if description or other fields are missing in database
  const descriptionText = pitch?.description || '';

  const short =
    descriptionText.length > 140
      ? descriptionText.slice(0, 140) + '...'
      : descriptionText;

  return (
    <div className="card pitch-card">
      <div className="pitch-head">
        <h3>
          <Link to={`/pitches/${pitch?._id}`}>{pitch?.title || 'Untitled Pitch'}</Link>
        </h3>
        <span className="badge">{pitch?.stage || 'unknown'}</span>
      </div>
      <p className="muted">
        {pitch?.sector || 'General'} · by {pitch?.founder?.name || 'Unknown'}
      </p>
      <p>{short || 'No description provided.'}</p>
      <strong>Funding ask: ₹{(pitch?.fundingAsk || 0).toLocaleString()}</strong>
    </div>
  );
}
