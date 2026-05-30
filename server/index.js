require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rewriteRoute = require('./routes/rewrite');
 
const app = express();
const PORT = process.env.PORT || 3001;
 
// Allow all origins — works for local dev and production
app.use(cors());
app.use(express.json());
 
// Routes
app.use('/api/rewrite', rewriteRoute);
 
// Health check — visit http://localhost:3001/health to confirm server is up
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TL;DR Me server is running' });
});
 
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
 