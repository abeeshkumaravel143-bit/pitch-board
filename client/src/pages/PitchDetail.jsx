import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function PitchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleDelete = async () => {
    if (!window.confirm('Delete this pitch? This cannot be undone.')) return;
    try {
      await api.delete(`/pitches/${id}`);
      navigate('/');
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Could not delete pitch' });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  // Check if current user is the founder who owns this pitch
  const isOwner = user?.role === 'founder' && pitch?.founder?._id === user?.id;

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
        <strong>Funding ask: ₹{(pitch.fundingAsk || 0).toLocaleString()}</strong>

        {/* Ownership action control block */}
        {isOwner && (
          <div className="actions" style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to={`/pitches/${id}/edit`} className="btn-link">Edit</Link>
            <button className="danger" onClick={handleDelete}>Delete</button>
          </div>
        )}
        {status.text && !sending && user?.role === 'founder' && <p className={status.type}>{status.text}</p>}
      </div>

      {user?.role === 'investor' && (
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
