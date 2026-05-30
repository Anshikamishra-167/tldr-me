require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rewriteRoute = require('./routes/rewrite');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from the React dev server and production URL
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CLIENT_URL || 'https://your-app.netlify.app'
  ]
}));

app.use(express.json());

// Routes
app.use('/api/rewrite', rewriteRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TL;DR Me server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
