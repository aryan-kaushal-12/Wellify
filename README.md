# 📘 AI-Generated Wellness Recommendation Board  
*A MERN + HuggingFace AI Powered Health Tips App*

## ⭐ 1. Project Setup & Demo

### 🔧 **Backend Setup**
```bash
cd backend
npm install
npm run dev
```
Backend runs at:
```
http://localhost:5000
```

### 🎨 **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at:
```
http://localhost:5173
```


## ⭐ 2. Problem Understanding

### 🔍 **Problem Summary**
The goal of the project is to create a **personalized wellness recommendation board** that uses AI to generate health tips based on a user’s profile.

### 🎯 **Primary Objectives**
1. Capture user profile: **Age**, **Gender**, **Wellness Goal**  
2. Generate **5 personalized wellness tips** using AI  
3. Show tips as **scrollable cards**  
4. On click → generate **detailed explanation + 4 actionable steps**  
5. Allow saving favorite tips locally

### ✔️ Assumptions
- AI output may vary; fallback logic used when needed  
- User saved tips stored locally (not in DB)  
- App is for general wellness, not medical advice  


## ⭐ 3. AI Prompts & Iterations

### 📌 Initial Tip Generation Prompt
```
Generate a JSON array of exactly 5 items.
Each item must be: { "id": "string", "icon": "emoji", "title": "string", "short": "string" }.
Return ONLY the JSON array.
```

### 📌 Tip Expansion Prompt
```
Expand this tip into:
{
  "explanation": "3 short paragraphs",
  "steps": ["step1","step2","step3","step4"]
}
Return only valid JSON.
```

### ⚠️ Challenges + Refinements
- Many models return **non‑JSON output**
- Added regex‑based JSON extraction
- Added deterministic fallback if AI fails
- Switched from deprecated **api-inference** → **router** endpoint
- Later adopted official **@huggingface/inference** client  


## ⭐ 4. Architecture & Code Structure

### 🏛️ Architecture Diagram
```
Frontend (React + Vite + Tailwind)
   |
   --> Backend API (Express.js)
          |
          --> HuggingFace AI Router
          --> MongoDB (User Auth)
```

### 📂 Folder Structure

#### Backend
```
backend/
├── server.js
├── .env
├── config/db.js
├── routes/auth.js
├── routes/wellness.js
├── utils/ai.js
└── models/User.js
```

#### Frontend
```
frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   ├── services/api.js
│   ├── pages/
│   │   ├── ProfileCapture.jsx
│   │   ├── TipsBoard.jsx
│   │   ├── TipDetail.jsx
│   │   ├── Saved.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── components/TipCard.jsx
```



## ⭐ 5. Known Issues / Improvements

### Known Issues
- HF models sometimes return noisy output  
- Slow response for large models  
- Saved tips only stored locally  
- Basic UI styling  
- Limited profile validation  

### Improvements with More Time
- Use JSON-Mode LLMs  
- Store saved tips in MongoDB  
- Add dark mode + animations  
- Offline caching (IndexedDB)  
- Multi-step onboarding form  


## ⭐ 6. Bonus Work
- Deterministic fallback system  
- Robust AI output parser  
- JWT login/register  
- Reusable component design  
- Responsive mobile-first layout  
