const express = require('express');
const router = express.Router();
 
const LEVEL_PROMPTS = {
  0: "Rewrite this text as if explaining to a 5-year-old child. Use very simple words, short sentences, fun comparisons like 'it's like when you...' and a warm playful tone. No jargon whatsoever.",
  1: "Rewrite this text for a middle school student (age 12-14). Use clear everyday language, relatable examples, and a friendly conversational tone. Avoid technical jargon but keep key concepts.",
  2: "Rewrite this text for a college undergraduate. Use structured paragraphs, introduce terminology with brief explanations, and maintain an analytical but accessible tone.",
  3: "Rewrite this text for a domain expert. Use precise technical vocabulary, assume strong background knowledge, be concise and information-dense. Skip basic explanations.",
  4: "Rewrite this text at a PhD academic level. Use rigorous academic language, domain-specific terminology, nuanced arguments, and a formal scholarly tone."
};
 
// POST /api/rewrite
router.post('/', async (req, res) => {
  const { text, level } = req.body;
 
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: 'Text must be at least 10 characters.' });
  }
  if (level === undefined || level < 0 || level > 4) {
    return res.status(400).json({ error: 'Level must be between 0 and 4.' });
  }
 
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env file' });
  }
 
  const prompt = LEVEL_PROMPTS[level];
  const fullPrompt = `${prompt}\n\nIMPORTANT: Output ONLY the rewritten text. No commentary, no explanations, no preamble.\n\n---\n\n${text.slice(0, 4000)}`;
 
  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
 
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
 
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
      })
    });
 
    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      res.write(`data: ${JSON.stringify({ error: err.error?.message || 'Gemini API error' })}\n\n`);
      res.end();
      return;
    }
 
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();
 
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
 
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
 
      for (const line of lines) {
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch (e) { /* skip malformed chunks */ }
      }
    }
 
    res.write('data: [DONE]\n\n');
    res.end();
 
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
 
module.exports = router;