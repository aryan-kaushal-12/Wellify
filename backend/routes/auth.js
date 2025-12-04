const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
}
function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });
}

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, name } = req.body;
    let u = await User.findOne({ email });
    if (u) return res.status(400).json({ message: 'Email already used' });
    const salt = await bcrypt.genSalt(10);
    const pw = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: pw });
    const accessToken = createAccessToken({ id: user._id, email: user.email });
    const refreshToken = createRefreshToken({ id: user._id, email: user.email });
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge: 7*24*3600*1000 });
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name }});
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const accessToken = createAccessToken({ id: user._id, email: user.email });
    const refreshToken = createRefreshToken({ id: user._id, email: user.email });
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge: 7*24*3600*1000 });
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name }});
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } catch (e) { return res.status(401).json({ message: 'Invalid refresh token' }); }
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const found = user.refreshTokens.some(rt => rt.token === token);
    if (!found) return res.status(401).json({ message: 'Revoked' });
    const newAccess = createAccessToken({ id: user._id, email: user.email });
    const newRefresh = createRefreshToken({ id: user._id, email: user.email });
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
    user.refreshTokens.push({ token: newRefresh, createdAt: new Date() });
    await user.save();
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'lax', maxAge: 7*24*3600*1000 });
    res.json({ accessToken: newAccess });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
          await user.save();
        }
      } catch (e) { /* ignore */ }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
