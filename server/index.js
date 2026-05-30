require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rewriteRoute = require('./routes/rewrite');
 
const app = express();
const PORT = process.env.PORT || 3001;
 
// Allow all localhost ports + production URL
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true)
    }
    const allowed = process.env.CLIENT_URL || 'https://your-app.netlify.app'
    if (origin === allowed) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  }
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
