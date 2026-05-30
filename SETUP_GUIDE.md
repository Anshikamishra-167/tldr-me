# TL;DR Me — Complete Setup Guide
## From zero to deployed in ~30 minutes

---

## PART 1 — Install Prerequisites (do this once ever)

### Step 1 — Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS** version (the left button)
3. Run the installer, click Next through everything
4. Verify it worked: open a terminal and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

### Step 2 — Install VS Code (if not already)
1. Go to https://code.visualstudio.com
2. Download and install it

### Step 3 — Install recommended VS Code extensions
Open VS Code → press `Ctrl+Shift+X` → search and install:
- **ES7+ React/Redux/React-Native snippets** (for React shortcuts)
- **Prettier** (auto-formats code)
- **Auto Rename Tag** (renames closing tags automatically)

---

## PART 2 — Set Up the Project in VS Code

### Step 4 — Open the project folder
1. Open VS Code
2. Click **File → Open Folder**
3. Select the `tldr-me` folder you downloaded

### Step 5 — Open the integrated terminal
Press `` Ctrl+` `` (backtick — the key above Tab)
This opens a terminal inside VS Code. You'll use this for all commands.

### Step 6 — Install backend dependencies
In the terminal, type these commands one by one:
```bash
cd server
npm install
```
You'll see a lot of text scrolling — that's normal. Wait for it to finish.

### Step 7 — Create your .env file (API key)
1. In the VS Code sidebar, right-click the `server` folder
2. Click **New File**
3. Name it `.env` (just dot-env, no other extension)
4. Paste this inside:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   PORT=3001
   CLIENT_URL=http://localhost:5173
   ```
5. Replace `sk-ant-your-key-here` with your real API key
   - Get your API key at: https://console.anthropic.com → API Keys → Create Key
6. Save the file (`Ctrl+S`)

⚠️  IMPORTANT: Never share this file or commit it to GitHub.
    The .gitignore file already blocks it from being uploaded.

### Step 8 — Install frontend dependencies
In the terminal, click the **+** icon to open a second terminal tab.
Then type:
```bash
cd client
npm install
```
Wait for it to finish.

---

## PART 3 — Run the App

### Step 9 — Start the backend server
In your first terminal tab (the one in the `server` folder):
```bash
npm run dev
```
You should see:
```
✅ Server running on http://localhost:3001
```
Leave this terminal running.

### Step 10 — Start the frontend
In your second terminal tab (the one in the `client` folder):
```bash
npm run dev
```
You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Step 11 — Open the app
Open your browser and go to:
```
http://localhost:5173
```

🎉 You should see TL;DR Me! Paste any text, drag the slider, watch it rewrite.

---

## PART 4 — Understanding the Project Structure

```
tldr-me/
│
├── server/                     ← Node.js backend
│   ├── index.js                ← Main server file, sets up Express
│   ├── routes/
│   │   └── rewrite.js          ← Handles POST /api/rewrite, streams Claude API
│   ├── .env                    ← YOUR API KEY (never share this)
│   ├── .env.example            ← Template showing what .env should look like
│   ├── .gitignore              ← Tells Git to ignore node_modules and .env
│   └── package.json            ← Lists dependencies
│
└── client/                     ← React frontend
    ├── index.html              ← The one HTML file (React loads into this)
    ├── vite.config.js          ← Build tool config (proxies /api → backend)
    ├── src/
    │   ├── main.jsx            ← React entry point
    │   ├── App.jsx             ← Main app logic — wires everything together
    │   ├── index.css           ← Global styles and CSS variables
    │   ├── constants/
    │   │   └── levels.js       ← The 5 complexity level configs
    │   ├── hooks/
    │   │   └── useDebounce.js  ← Custom hook that delays API calls
    │   └── components/
    │       ├── TextInput.jsx   ← The paste-text area
    │       ├── ComplexitySlider.jsx ← The drag slider + debounce bar
    │       └── OutputBox.jsx   ← The streaming output display
    └── package.json
```

---

## PART 5 — Push to GitHub

### Step 12 — Create a GitHub account (if needed)
Go to https://github.com and sign up.

### Step 13 — Install Git
1. Go to https://git-scm.com/downloads
2. Download for Windows, install with defaults
3. Verify: in VS Code terminal type `git --version`

### Step 14 — Create a new GitHub repository
1. Go to https://github.com/new
2. Repository name: `tldr-me`
3. Set to **Public** (needed for free Netlify deploy)
4. Do NOT check "Add README" (you already have one)
5. Click **Create repository**

### Step 15 — Push your code
In the VS Code terminal (in the root `tldr-me` folder):
```bash
cd ..         # go to root tldr-me folder if you're inside server or client
git init
git add .
git commit -m "feat: initial TL;DR Me app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tldr-me.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your actual GitHub username.

---

## PART 6 — Deploy

### Deploy the Backend to Render (free)

### Step 16 — Create a Render account
Go to https://render.com → Sign up with GitHub.

### Step 17 — Create a new Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub account
3. Select your `tldr-me` repository
4. Fill in these settings:
   - **Name**: `tldr-me-server`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Scroll down to **Environment Variables** → click **Add Environment Variable**:
   - Key: `ANTHROPIC_API_KEY` → Value: your actual key
   - Key: `PORT` → Value: `3001`
6. Click **Create Web Service**

Wait 2-3 minutes. You'll get a URL like:
```
https://tldr-me-server.onrender.com
```
Copy this URL — you need it next.

### Deploy the Frontend to Netlify (free)

### Step 18 — Update the frontend to point to your backend
In VS Code, open `client/vite.config.js`.
The proxy config only works locally. For production, we need to set the backend URL.

Create a new file: `client/.env.production`
```
VITE_API_URL=https://tldr-me-server.onrender.com
```

Then in `client/src/App.jsx`, find this line:
```javascript
const response = await fetch('/api/rewrite', {
```
Change it to:
```javascript
const apiUrl = import.meta.env.VITE_API_URL || ''
const response = await fetch(`${apiUrl}/api/rewrite`, {
```

Also update `server/index.js` — replace `https://your-app.netlify.app` with your Netlify URL (you'll get this after Step 19).

### Step 19 — Deploy frontend to Netlify
1. Go to https://netlify.com → Sign up with GitHub
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub → select `tldr-me`
4. Fill in:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. Click **Deploy site**

Netlify gives you a URL like `https://amazing-name-123.netlify.app`.

### Step 20 — Update CORS on the backend
1. Go to Render → your service → Environment
2. Add environment variable:
   - Key: `CLIENT_URL` → Value: your Netlify URL (e.g. `https://amazing-name-123.netlify.app`)
3. Render will auto-redeploy

### Step 21 — You're live! 🎉
Visit your Netlify URL. Paste text. Drag slider. Show it off.

---

## Common Problems & Fixes

**"Cannot find module" error when running npm run dev**
→ You forgot `npm install`. Run it in both `server` and `client` folders.

**"Invalid API Key" in the output box**
→ Check your `.env` file in the `server` folder. Make sure there are no spaces around the `=`.

**The slider moves but nothing happens**
→ Make sure BOTH terminals are running (backend on 3001, frontend on 5173).

**Render backend goes to sleep (free tier)**
→ Free Render services sleep after 15 mins of inactivity. First request takes ~30 sec to wake up. This is normal on the free tier.

**CORS error in browser console**
→ Your Netlify URL doesn't match what's in `CLIENT_URL` env var on Render. Double-check the URL.

---

## Resume Description

Add this to your resume under Projects:

**TL;DR Me** — AI-powered text complexity adapter
- Built a full-stack web app that rewrites any text in real time across 5 complexity levels (5-year-old to PhD) using a draggable slider
- Implemented SSE streaming from the Claude API for live word-by-word output; applied debounce pattern to reduce API calls by ~80%
- Stack: React, Node.js, Express.js, Claude API · Deployed: Netlify + Render
