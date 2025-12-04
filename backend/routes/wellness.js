const express = require('express');
const router = express.Router();
const { generateTips, expandTip } = require('../utils/openai');

// Generate 5 tips
router.post('/generate', async (req, res) => {
  try {
    const profile = req.body || {};
    const tips = await generateTips(profile);
    // ensure we return id/title/icon/short
    const normalized = tips.map((t, idx) => ({
      id: t.id || `tip${idx+1}`,
      icon: t.icon || (['🥦','💧','🚶','😴','🧘'][idx % 5]),
      title: t.title || (t.short ? t.short.split('.').slice(0,1)[0] : `Tip ${idx+1}`),
      short: t.short || t.title || 'Small actionable suggestion.'
    }));
    res.json({ tips: normalized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate tips' });
  }
});

// Expand a tip into explanation + steps
router.post('/expand', async (req, res) => {
  try {
    const { profile, tip } = req.body;
    if (!tip) return res.status(400).json({ message: 'tip required' });
    const expanded = await expandTip(profile || {}, tip.short || tip.title || '');
    res.json({ ...expanded });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to expand tip' });
  }
});

module.exports = router;
