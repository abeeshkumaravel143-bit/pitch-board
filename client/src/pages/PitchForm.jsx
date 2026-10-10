import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

const STAGES = ['idea', 'prototype', 'seed', 'series-a'];
const EMPTY = { title: '', sector: '', stage: 'idea', fundingAsk: '', description: '' };

export default function PitchForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // In edit mode, load the existing pitch into the form
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/pitches/${id}`)
      .then((res) => {
        const { title, sector, stage, fundingAsk, description } = res.data;
        setForm({ title, sector, stage, fundingAsk, description });
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load pitch'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, fundingAsk: Number(form.fundingAsk) };
      const { data } = isEdit
        ? await api.put(`/pitches/${id}`, payload)
        : await api.post('/pitches', payload);
      navigate(`/pitches/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save pitch');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/">&larr; Back to pitches</Link>
      <div className="card">
        <h2>{isEdit ? 'Edit pitch' : 'New pitch'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input name="sector" placeholder="Sector (e.g. Fintech)" value={form.sector} onChange={handleChange} required />
          <select name="stage" value={form.stage} onChange={handleChange}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input name="fundingAsk" type="number" min="0" placeholder="Funding ask (₹)" value={form.fundingAsk} onChange={handleChange} required />
          <textarea name="description" rows="6" placeholder="Describe your startup" value={form.description} onChange={handleChange} required />
          <button disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create pitch'}</button>
        </form>
      </div>
    </div>
  );
}