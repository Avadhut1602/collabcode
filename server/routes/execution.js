// server/routes/execution.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { runCode, getExecutionHistory } = require('../controllers/executionController');

const router = express.Router();

router.use(protect);
router.post('/run', runCode);
router.get('/history/:roomId', getExecutionHistory);

module.exports = router;
