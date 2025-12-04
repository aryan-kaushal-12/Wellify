// backend/utils/ai.js
const axios = require('axios');

const HF_ROUTER = 'https://router.huggingface.co/v1/inference';
const HF_KEY = process.env.HF_API_KEY || '';
const HF_MODEL = process.env.HF_MODEL || 'google/flan-t5-large';
const HF_MAX_TOKENS = parseInt(process.env.HF_MAX_TOKENS || '512', 10);
const HF_TEMPERATURE = parseFloat(process.env.HF_TEMPERATURE || '0.7');

function deterministicTips(profile) {
  const base = [
    { id: 'tip1', icon: '🥦', title: 'Eat a colorful plate', short: 'Aim for 3 colors on your plate each meal — fruits or veggies add nutrients.' },
    { id: 'tip2', icon: '💧', title: 'Hydrate regularly', short: 'Drink small glasses of water throughout the day; keep a bottle nearby.' },
    { id: 'tip3', icon: '🚶', title: 'Move for 15', short: 'Walk or stretch for 15 minutes every few hours to reset energy.' },
    { id: 'tip4', icon: '😴', title: 'Improve sleep habits', short: 'Wind down early: screen-off 30 mins before bed and keep a routine.' },
    { id: 'tip5', icon: '🧘', title: 'Short mindfulness', short: 'Try a 5-minute breathing or mindfulness exercise to reduce stress.' }
  ];
  if (profile.goal && profile.goal.toLowerCase().includes('weight')) {
    base[0].short = 'Focus on whole foods and portion control to support weight goals.';
    base[2].short = 'Add short walks after meals to boost metabolism.';
  }
  return base;
}

function buildTipsPromptText(profile) {
  const age = profile.age || 'unknown';
  const gender = profile.gender || 'unspecified';
  const goal = profile.goal || 'general wellness';
  return `You are a friendly concise wellness coach. Based on the user profile below, generate a JSON array of 5 tips.
Each item must be an object with keys: id (short unique string), icon (single emoji), title (<=6 words), short (1-2 sentence actionable tip).
User profile: age: ${age}, gender: ${gender}, goal: ${goal}.
Return only valid JSON array.`;
}

function buildExpandPromptText(profile, tipShort) {
  const age = profile.age || 'unknown';
  const gender = profile.gender || 'unspecified';
  const goal = profile.goal || 'general wellness';
  return `You are a friendly wellness coach. Expand the short tip below into:
1) "explanation": a concise 3-4 short-paragraph explanation (keep simple and encouraging).
2) "steps": an array of 4 clear, short actionable steps.
Return a single valid JSON object: { "explanation": "...", "steps": ["...","...","...","..."] }.

Profile: age: ${age}, gender: ${gender}, goal: ${goal}.
Short tip: "${tipShort}"`;
}

function tryParseJson(text) {
  if (!text) return null;
  let s = text.trim();
  // remove markdown fences if present
  if (s.startsWith('```')) {
    const parts = s.split('```');
    if (parts.length >= 2) s = parts[1];
  }
  try {
    return JSON.parse(s);
  } catch (e) {
    const start = s.indexOf('[');
    const end = s.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      const sub = s.slice(start, end + 1);
      try { return JSON.parse(sub); } catch (e2) {}
    }
    // try object form
    const oStart = s.indexOf('{');
    const oEnd = s.lastIndexOf('}');
    if (oStart !== -1 && oEnd !== -1 && oEnd > oStart) {
      const sub = s.slice(oStart, oEnd + 1);
      try { return JSON.parse(sub); } catch (e2) {}
    }
    return null;
  }
}

/**
 * Call Hugging Face Router endpoint.
 * This attempts to support both text-generation models and chat-style models by:
 * - sending {"inputs": "...", "parameters": {...}} to the router endpoint
 * - if response contains outputs / generated_text / or result string, return text
 */
async function callHfRouter(model, inputText) {
  if (!HF_KEY) return null;
  const url = `${HF_ROUTER}/${encodeURIComponent(model)}`;
  const payload = {
    inputs: inputText,
    parameters: {
      max_new_tokens: HF_MAX_TOKENS,
      temperature: HF_TEMPERATURE
    }
  };

  try {
    console.debug('[HF DEBUG] Calling URL:', url);
    console.debug('[HF DEBUG] Payload:', JSON.stringify(payload).slice(0,1000));

    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${HF_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });

    const d = resp.data;
    console.debug('[HF DEBUG] response keys:', Object.keys(d || {}));
    // router may return { generated_text: "..." } or { outputs: [{ generated_text: "..." }] } or a plain string
    if (typeof d === 'string') return d;
    if (d?.generated_text) return d.generated_text;
    if (Array.isArray(d?.outputs) && d.outputs.length && d.outputs[0].generated_text) {
      return d.outputs[0].generated_text;
    }
    // Some models return { results: [...] } or other shapes; stringify fallback
    return JSON.stringify(d);
  } catch (err) {
    // Log more debug information
    const info = err?.response?.data || err.message || err;
    console.error('HF inference error:', info);
    return null;
  }
}

async function generateTips(profile) {
  if (HF_KEY) {
    try {
      const prompt = buildTipsPromptText(profile);
      const hfText = await callHfRouter(HF_MODEL, prompt);
      const parsed = tryParseJson(hfText);
      if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      // if parsed exists and length >=1 return parsed (best effort)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      // try to heuristically parse single JSON within text
    } catch (e) {
      console.error('Error using HF for tips:', e);
    }
  }
  return deterministicTips(profile);
}

async function expandTip(profile, tipShort) {
  if (HF_KEY) {
    try {
      const prompt = buildExpandPromptText(profile, tipShort);
      const hfText = await callHfRouter(HF_MODEL, prompt);
      // try parse object
      let parsed = null;
      try { parsed = JSON.parse(hfText); } catch (e) { parsed = tryParseJson(hfText); }
      if (parsed && (parsed.explanation || parsed.steps)) {
        if (!Array.isArray(parsed.steps)) {
          parsed.steps = String(parsed.steps || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0,4);
        }
        return { explanation: String(parsed.explanation || parsed.text || hfText), steps: parsed.steps || [] };
      }
      // fallback: use returned text as explanation
      const explanation = hfText || `Detailed advice: ${tipShort}`;
      return { explanation, steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'] };
    } catch (e) {
      console.error('Error using HF to expand tip:', e);
      return { explanation: `Detailed advice: ${tipShort}`, steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'] };
    }
  }
  return { explanation: `Detailed advice: ${tipShort}`, steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'] };
}

module.exports = { generateTips, expandTip };
