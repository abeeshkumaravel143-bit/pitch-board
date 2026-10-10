import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const isFounder = user.role === 'founder';
  const [pitches, setPitches] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests = [api.get('/interests/mine')];
    if (isFounder) requests.push(api.get('/pitches', { params: { mine: true } }));

    Promise.all(requests)
      .then(([interestRes, pitchRes]) => {
        setInterests(interestRes.data);
        if (pitchRes) setPitches(pitchRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard'))
      .finally(() => setLoading(false));
  }, [isFounder]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      {isFounder && (
        <>
          <div className="pitch-head">
            <h3>My pitches ({pitches.length})</h3>
            <Link to="/pitches/new" className="btn-link">+ New pitch</Link>
          </div>
          {pitches.length === 0 && <p>You have not created any pitches yet.</p>}
          {pitches.map((p) => (
            <div className="card" key={p._id}>
              <div className="pitch-head">
                <Link to={`/pitches/${p._id}`}>{p.title}</Link>
                <span className="badge">{p.stage}</span>
              </div>
              <p className="muted">{p.sector} · ₹{p.fundingAsk.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </>
      )}

      <h3>{isFounder ? 'Interest received' : 'My interests'} ({interests.length})</h3>
      {interests.length === 0 && <p>Nothing here yet.</p>}
      {interests.map((i) => (
        <div className="card" key={i._id}>
          <strong>{i.pitch?.title || 'Deleted pitch'}</strong>
          {isFounder ? (
            <p className="muted">From {i.investor?.name} ({i.investor?.email})</p>
          ) : (
            <p className="muted">{i.pitch?.sector} · {i.pitch?.stage}</p>
          )}
          {i.message && <p>"{i.message}"</p>}
          <p className="muted">{new Date(i.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}