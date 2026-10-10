import { useEffect, useState } from 'react';
import api from '../api/api';
import PitchCard from '../components/PitchCard';

const STAGES = ['idea', 'prototype', 'seed', 'series-a'];

export default function Pitches() {
  const [filters, setFilters] = useState({ q: '', sector: '', stage: '' });
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reload the list whenever a filter changes (waits 300ms while typing)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      api
        .get('/pitches', { params })
        .then((res) => {
          setPitches(res.data);
          setError('');
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load pitches'))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <h2>Startup Pitches</h2>

      <div className="card filters">
        <input name="q" placeholder="Search by title" value={filters.q} onChange={handleChange} />
        <input name="sector" placeholder="Sector (e.g. Energy)" value={filters.sector} onChange={handleChange} />
        <select name="stage" value={filters.stage} onChange={handleChange}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading pitches...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && pitches.length === 0 && <p>No pitches found.</p>}

      {pitches.map((pitch) => (
        <PitchCard key={pitch._id} pitch={pitch} />
      ))}
    </div>
  );
}
