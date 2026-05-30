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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set on server.' });
  }

  const prompt = `${LEVEL_PROMPTS[level || 0]}\n\nOutput ONLY the rewritten text, nothing else.\n\n---\n\n${text.slice(0, 4000)}`;

  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at adapting text complexity. Rewrite texts naturally and fluently. Output ONLY the rewritten text — no commentary, no explanations, no preamble.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
        stream: true
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.json();
      const errMsg = err.error?.message || 'Groq API error';
      console.error('Groq error:', errMsg);
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
      res.end();
      return;
    }

    // Stream the response
    const reader = groqRes.body.getReader();
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
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch (e) { /* skip malformed chunks */ }
      }
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