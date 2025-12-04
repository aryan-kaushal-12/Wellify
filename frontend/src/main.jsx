import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import ProfileCapture from './pages/ProfileCapture';
import TipsBoard from './pages/TipsBoard';
import TipDetail from './pages/TipDetail';
import Saved from './pages/Saved';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<ProfileCapture />} />
          <Route path="tips" element={<TipsBoard />} />
          <Route path="tip/:id" element={<TipDetail />} />
          <Route path="saved" element={<Saved />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
