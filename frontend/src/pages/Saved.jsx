import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Saved(){
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setSaved(JSON.parse(localStorage.getItem('saved_tips') || '[]'));
  }, []);

  const remove = (id) => {
    const updated = saved.filter(s => s.id !== id);
    localStorage.setItem('saved_tips', JSON.stringify(updated));
    setSaved(updated);
  };

  if (!saved.length) return <div>No saved tips yet. Go explore tips!</div>;

  return (
    <div className="space-y-3">
      {saved.map(t => (
        <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="text-3xl">{t.icon}</div>
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-gray-600">{t.short}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/tip/${t.id}`} state={{ tip: t }} className="text-blue-600">Open</Link>
            <button onClick={() => remove(t.id)} className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}
