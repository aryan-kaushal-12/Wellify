require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const wellnessRoutes = require('./routes/wellness');

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND, credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/wellness', wellnessRoutes); 

app.get('/', (req, res) => res.send('Wellness AI Backend'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
