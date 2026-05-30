const express = require('express');
const router = express.Router();

const LEVEL_PROMPTS = {
  0: "Rewrite this text as if explaining to a 5-year-old child. Use very simple words, short sentences, fun comparisons and a warm playful tone. No jargon whatsoever.",
  1: "Rewrite this text for a middle school student (age 12-14). Use clear everyday language, relatable examples, and a friendly conversational tone.",
  2: "Rewrite this text for a college undergraduate. Use structured paragraphs, introduce terminology with brief explanations, and maintain an analytical but accessible tone.",
  3: "Rewrite this text for a domain expert. Use precise technical vocabulary, assume strong background knowledge, be concise and information-dense.",
  4: "Rewrite this text at a PhD academic level. Use rigorous academic language, domain-specific terminology, nuanced arguments, and a formal scholarly tone."
};

router.post('/', async (req, res) => {
  const { text, level } = req.body;

  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: 'Text must be at least 10 characters.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set on server.' });
  }

  const prompt = `${LEVEL_PROMPTS[level || 0]}\n\nOutput ONLY the rewritten text, nothing else.\n\n---\n\n${text.slice(0, 4000)}`;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Use the non-streaming endpoint first to confirm it works,
    // then stream word by word from our side
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = data.error?.message || 'Gemini API error';
      console.error('Gemini error:', errMsg);
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
      res.end();
      return;
    }

    const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!fullText) {
      res.write(`data: ${JSON.stringify({ error: 'No response from Gemini' })}\n\n`);
      res.end();
      return;
    }

    // Simulate streaming by sending words one by one
    const words = fullText.split(' ');
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
      await new Promise(r => setTimeout(r, 20));
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Server error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;