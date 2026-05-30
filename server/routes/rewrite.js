const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Level prompts — same as the frontend constants
const LEVEL_PROMPTS = {
  0: "Rewrite this text as if explaining to a 5-year-old child. Use very simple words, short sentences, fun comparisons like 'it's like when you...' and a warm playful tone. No jargon whatsoever. Make it feel like a bedtime story explanation.",
  1: "Rewrite this text for a middle school student (age 12-14). Use clear everyday language, relatable examples from school life or pop culture, and a friendly conversational tone. Avoid technical jargon but keep the key concepts intact.",
  2: "Rewrite this text for a college undergraduate student. Use structured paragraphs, introduce relevant terminology with brief explanations, and maintain an analytical but accessible tone. Assume basic subject knowledge.",
  3: "Rewrite this text for a domain expert or professional in the field. Use precise technical vocabulary, assume strong background knowledge, be concise and information-dense. Skip basic explanations entirely.",
  4: "Rewrite this text at a PhD academic level. Use rigorous academic language, domain-specific terminology, nuanced arguments with appropriate hedging, and a formal scholarly tone. Prioritise precision and complexity over accessibility."
};

// POST /api/rewrite
// Body: { text: string, level: 0-4 }
// Response: SSE stream of text chunks
router.post('/', async (req, res) => {
  const { text, level } = req.body;

  // Validation
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: 'Text must be at least 10 characters.' });
  }
  if (level === undefined || level < 0 || level > 4) {
    return res.status(400).json({ error: 'Level must be between 0 and 4.' });
  }

  const prompt = LEVEL_PROMPTS[level];

  // Set SSE headers so the client can stream the response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Stream from Claude
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: "You are an expert at adapting text complexity. Rewrite texts naturally and fluently. Never explain what you're doing or add meta-commentary — output ONLY the rewritten text.",
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\n---\n\n${text.slice(0, 4000)}`
        }
      ]
    });

    // Forward each chunk to the client as an SSE event
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta?.type === 'text_delta'
      ) {
        // SSE format: data: <payload>\n\n
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    // Signal stream end
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Claude API error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
