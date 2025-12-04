import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const change = (e) => setForm({...form, [e.target.name]: e.target.value});
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      window.dispatchEvent(new Event('authChange'));
      nav('/');
    } catch (err) {
      setErr(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Login</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input name="email" value={form.email} onChange={change} placeholder="Email" className="w-full p-2 border rounded" />
        <input name="password" type="password" value={form.password} onChange={change} placeholder="Password" className="w-full p-2 border rounded" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}
