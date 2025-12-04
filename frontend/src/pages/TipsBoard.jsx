import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TipCard from '../components/TipCard';
import { useNavigate } from 'react-router-dom';

export default function TipsBoard(){
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const profile = JSON.parse(localStorage.getItem('wellness_profile') || '{}');

  const fetchTips = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/wellness/generate', profile);
      setTips(res.data.tips || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tips. Try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTips(); }, []);

  const handleSave = (tip) => {
    const saved = JSON.parse(localStorage.getItem('saved_tips') || '[]');
    if (!saved.some(s => s.id === tip.id)) {
      saved.push(tip);
      localStorage.setItem('saved_tips', JSON.stringify(saved));
      alert('Saved locally');
    } else alert('Already saved');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Tips</h2>
        <div className="flex gap-2">
          <button onClick={fetchTips} className="px-3 py-1 border rounded">Regenerate</button>
          <button onClick={() => navigate('/saved')} className="px-3 py-1 border rounded">View Saved</button>
        </div>
      </div>

      {loading && <div>Loading tips...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-3">
        {tips.map(t => <TipCard key={t.id} tip={t} onSave={handleSave} />)}
      </div>
    </div>
  );
}
