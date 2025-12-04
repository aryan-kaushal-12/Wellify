import React from 'react';
import { Link } from 'react-router-dom';

export default function TipCard({ tip, onSave }) {
  return (
    <div className="card flex items-start gap-4">
      <div className="text-4xl">{tip.icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-lg text-gray-900">{tip.title}</div>
        <p className="text-sm subtle mt-1">{tip.short}</p>
        <div className="mt-3 flex gap-3 items-center">
          <Link to={`/tip/${tip.id}`} state={{ tip }} className="text-sm text-brand font-medium">Read more</Link>
          <button onClick={() => onSave(tip)} className="btn-brand-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
