import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function PitchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get(`/pitches/${id}`)
      .then((res) => setPitch(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load pitch'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInterest = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: '', text: '' });
    try {
      await api.post(`/pitches/${id}/interest`, { message });
      setStatus({ type: 'success', text: 'Your interest was sent to the founder.' });
      setMessage('');
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Could not send interest' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <Link to="/">&larr; Back to pitches</Link>
      <div className="card">
        <div className="pitch-head">
          <h2>{pitch.title}</h2>
          <span className="badge">{pitch.stage}</span>
        </div>
        <p className="muted">
          {pitch.sector} · by {pitch.founder?.name || 'Unknown'}
        </p>
        <p>{pitch.description}</p>
        <strong>Funding ask: {pitch.fundingAsk.toLocaleString()}</strong>
      </div>

      {user.role === 'investor' && (
        <div className="card">
          <h3>Express interest</h3>
          {status.text && <p className={status.type}>{status.text}</p>}
          <form onSubmit={handleInterest}>
            <textarea
              rows="3"
              maxLength="500"
              placeholder="Optional message to the founder"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button disabled={sending}>{sending ? 'Sending...' : 'Send interest'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
