import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileCapture(){
  const [profile, setProfile] = useState({ age:'', gender:'', goal:'' });
  const navigate = useNavigate();

  const onChange = (e) => setProfile({...profile, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save profile locally for subsequent flows
    localStorage.setItem('wellness_profile', JSON.stringify(profile));
    navigate('/tips');
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Tell us about yourself</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="age" value={profile.age} onChange={onChange} placeholder="Age" className="w-full p-2 border rounded" />
        <select name="gender" value={profile.gender} onChange={onChange} className="w-full p-2 border rounded">
          <option value="">Select gender (optional)</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not">Prefer not to say</option>
        </select>
        <input name="goal" value={profile.goal} onChange={onChange} placeholder="Your main goal (e.g., lose weight, sleep better, reduce stress)" className="w-full p-2 border rounded" />
        <button className="w-full p-2 bg-blue-600 text-white rounded">Get my tips</button>
      </form>
    </div>
  );
}
