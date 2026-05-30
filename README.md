# TL;DR Me 🎚️

> Drag a slider. Watch any text rewrite itself from 5-year-old to PhD level in real time.

**Live Demo → [tldr-me.netlify.app](https://tldr-me.netlify.app)**

---

## What it does

Paste any dense article, research paper, or text. Drag the complexity slider across 5 levels and watch it rewrite instantly — streamed word by word.

| Level | Audience |
|-------|----------|
| 🧒 5-Year-Old | Simple words, playful tone |
| 🎒 Middle School | Clear, relatable, everyday language |
| 🎓 College | Structured, analytical, accessible |
| 💼 Expert | Technical, precise, information-dense |
| 🔬 PhD | Academic, rigorous, full terminology |

---

## Tech Stack

**Frontend**
- React + Vite
- Custom debounce hook (prevents excessive API calls)
- SSE streaming for real-time word-by-word output
- Deployed on Netlify

**Backend**
- Node.js + Express
- Groq API (Llama 3.3 70B)
- Server-Sent Events (SSE) streaming
- Deployed on Render

---

## Key Features

- **Debounced API calls** — waits for the user to stop moving the slider before firing, reducing API calls by ~80%
- **Streaming output** — text appears word by word in real time, not all at once
- **5 complexity levels** — each with a carefully engineered prompt
- **Abort controller** — cancels in-flight requests when the user changes level mid-stream

---

## Built by

**Anshika Mishra** — B.Tech CSE (Cybersecurity & Digital Forensics), VIT Bhopal

[Portfolio](https://anshika-mishra-portfolio.netlify.app) · [LinkedIn](https://linkedin.com/in/anshika-mishra268) · [GitHub](https://github.com/Anshikamishra-167)