# TL;DR Me 🎚️

> Drag a slider. Watch any text rewrite itself from 5-year-old to PhD level in real time.

Built with React + Node.js + Claude API. Features streaming output and debounced API calls.

---

## Project Structure

```
tldr-me/
├── client/          ← React frontend (Vite)
├── server/          ← Node.js + Express backend
└── README.md
```

---

## Quick Start

### 1. Install everything
```bash
# Terminal 1 — backend
cd server
npm install

# Terminal 2 — frontend
cd client
npm install
```

### 2. Add your API key
In `/server`, create a `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
```

### 3. Run both servers
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### 4. Open the app
Visit: http://localhost:5173

---

## Deploy

See deployment steps in the setup guide.
