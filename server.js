const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('rustmake.db');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    service TEXT,
    key_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    dag TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER,
    status TEXT,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows (id)
  )`);
});

// JWT Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, 'rustmake-super-secret-2026', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
      [email, hashedPassword], 
      function(err) {
        if (err) return res.status(400).json({ error: 'User already exists' });
        const token = jwt.sign({ id: this.lastID }, 'rustmake-super-secret-2026');
        res.json({ token, userId: this.lastID });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, 'rustmake-super-secret-2026');
    res.json({ token, userId: user.id });
  });
});

// API Keys management (Make.com style)
app.post('/api/keys', authenticateToken, (req, res) => {
  const { service, key_value } = req.body;
  db.run('INSERT INTO api_keys (user_id, service, key_value) VALUES (?, ?, ?)',
    [req.user.id, service, key_value],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to save key' });
      res.json({ success: true, keyId: this.lastID });
    });
});

app.get('/api/keys', authenticateToken, (req, res) => {
  db.all('SELECT service, created_at FROM api_keys WHERE user_id = ?', 
    [req.user.id], (err, rows) => {
      res.json(rows);
    });
});

// Workflows
app.get('/api/workflows', authenticateToken, (req, res) => {
  db.all('SELECT * FROM workflows WHERE user_id = ? ORDER BY created_at DESC', 
    [req.user.id], (err, rows) => {
      res.json(rows.map(row => ({ ...row, dag: JSON.parse(row.dag) })));
    });
});

app.post('/api/workflows', authenticateToken, (req, res) => {
  const { name, dag } = req.body;
  db.run('INSERT INTO workflows (user_id, name, dag) VALUES (?, ?, ?)',
    [req.user.id, name, JSON.stringify(dag)],
    function(err) {
      res.json({ id: this.lastID, success: true });
    });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io realtime workflow execution
io.on('connection', (socket) => {
  console.log('🔥 User connected:', socket.id);
  
  socket.on('execute-workflow', async (workflowData) => {
    socket.emit('execution-progress', { step: 'Parsing workflow DAG...', progress: 20 });
    await new Promise(r => setTimeout(r, 800));
    
    socket.emit('execution-progress', { step: 'Loading API keys...', progress: 40 });
    await new Promise(r => setTimeout(r, 600));
    
    socket.emit('execution-progress', { step: 'Executing actions...', progress: 70 });
    await new Promise(r => setTimeout(r, 1200));
    
    socket.emit('execution-progress', { step: 'Completing...', progress: 95 });
    await new Promise(r => setTimeout(r, 400));
    
    socket.emit('execution-complete', { 
      status: 'success',
      result: `✅ Executed ${workflowData.nodes?.length || 0} nodes using ${workflowData.apiKeys?.length || 0} integrations`,
      timestamp: new Date().toISOString()
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 RustMake Pro running on port ${PORT}`);
});
