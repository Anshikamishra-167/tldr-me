require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rewriteRoute = require('./routes/rewrite');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'https://tldr-me.netlify.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Render health checks, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log('CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

app.use('/api/rewrite', rewriteRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TL;DR Me server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
});