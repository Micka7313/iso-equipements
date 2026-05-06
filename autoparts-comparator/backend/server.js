'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');

const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/search', searchRouter);

// Fallback → SPA index
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AutoParts Comparator running on http://localhost:${PORT}`);
});
