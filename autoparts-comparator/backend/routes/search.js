'use strict';

const express = require('express');
const router = express.Router();
const vanheck = require('../services/VanheckService');

/**
 * GET /api/search?ref=XXXXXX
 * Queries all suppliers in parallel and returns a unified comparison array.
 */
router.get('/', async (req, res) => {
  const ref = (req.query.ref ?? '').trim();
  if (!ref) {
    return res.status(400).json({ error: 'Missing query parameter: ref' });
  }

  // Run all supplier queries in parallel; capture individual failures gracefully.
  const suppliers = [
    { name: 'VanHeck', fn: () => vanheck.searchByReference(ref) },
    // Add more suppliers here — same interface expected
  ];

  const results = await Promise.allSettled(suppliers.map((s) => s.fn()));

  const rows = [];
  const errors = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      rows.push(...result.value);
    } else {
      errors.push({ supplier: suppliers[i].name, error: result.reason?.message ?? String(result.reason) });
    }
  });

  res.json({ ref, rows, errors });
});

module.exports = router;
