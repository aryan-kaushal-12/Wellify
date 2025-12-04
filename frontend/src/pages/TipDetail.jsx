import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../services/api';

export default function TipDetail(){
  const loc = useLocation();
  const tipFromState = loc.state?.tip;
  const { id } = useParams();
  const [tip, setTip] = useState(tipFromState || null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  const profile = JSON.parse(localStorage.getItem('wellness_profile') || '{}');

  useEffect(() => {
    if (tip) expand(tip);
  }, [tip]);

  async function expand(t) {
    setLoading(true);
    try {
      const res = await api.post('/wellness/expand', { profile, tip: t });
      setExpanded(res.data);
    } catch (err) {
      console.error(err);
      setExpanded({ explanation: 'Could not get expanded advice. Try again.', steps: [] });
    } finally { setLoading(false); }
  }

  if (!tip) return <div>No tip selected. Go back to Tips.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex gap-4 items-center mb-4">
        <div className="text-4xl">{tip.icon}</div>
        <div>
          <h2 className="text-xl font-bold">{tip.title}</h2>
          <p className="text-sm text-gray-600">{tip.short}</p>
        </div>
      </div>

      <div className="mb-4">
        <button onClick={() => expand(tip)} className="px-3 py-1 border rounded mr-2">Regenerate explanation</button>
        <button onClick={() => {
          const saved = JSON.parse(localStorage.getItem('saved_tips') || '[]');
          if (!saved.some(s => s.id === tip.id)) {
            saved.push(tip); localStorage.setItem('saved_tips', JSON.stringify(saved)); alert('Saved');
          } else alert('Already saved');
        }} className="btn-brand-sm">Save tip</button>
      </div>

      {loading && <div>Generating detailed advice…</div>}

      {expanded && (
        <div>
          <div className="mb-4">
            <h3 className="font-semibold">Explanation</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{expanded.explanation}</p>
          </div>
          <div>
            <h3 className="font-semibold">Step-by-step</h3>
            <ol className="list-decimal list-inside">
              {expanded.steps?.map((s, i) => <li key={i} className="mb-1">{s}</li>)}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
