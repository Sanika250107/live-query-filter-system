const express = require('express');
const cors = require('cors');
const path = require('path');
const catalog = require('./catalog.json');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', records: catalog.length }));
app.get('/api/categories', (_req, res) => {
  res.json([...new Set(catalog.map(item => item.category))].sort());
});

app.get('/api/resources', (req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const categories = String(req.query.category || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'page must be >= 1 and limit must be between 1 and 100 (integers).' });
  }
  const filtered = catalog.filter(item => {
    const matchesSearch = !search || [item.title, item.category, item.level]
      .some(value => String(value).toLowerCase().includes(search));
    const matchesCategory = !categories.length || categories.includes(item.category.toLowerCase());
    return matchesSearch && matchesCategory;
  });
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const data = filtered.slice((page - 1) * limit, page * limit);
  res.json({ data, pagination: { page, limit, total, totalPages } });
});

const publicDir = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(publicDir));
app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
