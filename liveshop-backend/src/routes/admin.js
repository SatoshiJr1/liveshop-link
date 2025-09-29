const express = require('express');
const router = express.Router();

// Route de test simple
router.get('/test', (req, res) => {
  res.json({ message: 'Admin route works!' });
});

module.exports = router;


