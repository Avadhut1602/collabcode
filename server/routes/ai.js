// server/routes/ai.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { queryAI } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);
router.post('/query', queryAI);

module.exports = router;
