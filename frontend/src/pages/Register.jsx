import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const change = (e) => setForm({...form, [e.target.name]: e.target.value});
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      window.dispatchEvent(new Event('authChange'));
      nav('/');
    } catch (err) {
      setErr(err?.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Register</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input name="name" value={form.name} onChange={change} placeholder="Name" className="w-full p-2 border rounded" />
        <input name="email" value={form.email} onChange={change} placeholder="Email" className="w-full p-2 border rounded" />
        <input name="password" type="password" value={form.password} onChange={change} placeholder="Password" className="w-full p-2 border rounded" />
        <button className="w-full btn-primary">Register</button>
      </form>
    </div>
  );
}
