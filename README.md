# Make-Remake
A remake of make.com with enhanced potential. Enterprise Make.com clone - Node.js + Realtime + Auth

**RustMake Pro - Enterprise Make.com Clone**

**Production-ready** self-hosted automation platform built with Node.js

**Features**:
Realtime workflows - Socket.io live execution  
User authentication - JWT + bcrypt  
SQLite database - Users, API keys, workflows  
Visual drag-drop builder - Make.com style  
API key management- Secure storage  
Execution history - Track all runs  

**Deploy (3 Ways)**:

1. **Replit (Instant - RECOMMENDED)**
replit.com → New Repl → Node.js template
Copy ALL files → Click Run 
Gets instant public URL

2. **Render.com (Free Production Deploy)**
render.com → New Web Service → Connect GitHub repo
Build: npm install
Start: npm start
Free SSL + Custom domain

3. **Local Development**
npm install
npm start
Open http://localhost:3000

**Live Demo Features**:
Login: test@example.com / password123
Add OpenAI key: sk-...
Drag nodes: HTTP → OpenAI → Slack
Click Execute → Watch realtime logs

**Architecture**:
70% Node.js Core 30% Frontend
├── Express REST APIs ├── Drag-drop canvas
├── Socket.io realtime ├── React-like components
├── SQLite persistence ├── Responsive dashboard
└── JWT + bcrypt security └── Toolbar + panels

**Deploy & Test** :
**Option A: Instant Replit Deploy**

1. replit.com → "Create Repl" → Node.js
2. Copy-paste ALL files above
3. Click "Run" button
4. Get instant public URL: https://your-repl-name.yourusername.repl.co

**Option B: GitHub + Render**

1. Commit all files to GitHub
2. render.com → New → Web Service → Connect repo
3. Build Command: `npm install`
4. Start Command: `npm start`


**Make sure you have the requirements listed in [requirements.txt](requirements.txt) before to ensure smooth running**
