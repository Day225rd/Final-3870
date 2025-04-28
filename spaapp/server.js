const express   = require('express');
const path      = require('path');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security headers, CSP, etc.
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://code.jquery.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcElem: ["'self'", "https://code.jquery.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"]
    }
  })
);

// 1) Parse JSON bodies (for JSON APIs)
app.use(express.json());
// 2) Parse URL-encoded bodies (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store
const users = [];

// Registration endpoint
app.post('/api/register', (req, res) => {
  // Now req.body is guaranteed defined
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send('Missing required fields');
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).send('Email already registered');
  }
  users.push({ ...req.body });
  res.status(201).send('OK');
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).send('Invalid credentials');
  res.send('OK');
});

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
