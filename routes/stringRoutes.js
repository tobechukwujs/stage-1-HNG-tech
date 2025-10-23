const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');

// 1. Create/Analyze a new string
router.post('/strings', stringController.createStringStat);

// 2. Get a specific string by its value
router.get('/strings/:string_value', stringController.getStringStat);

// 3. Get all strings with filtering
router.get('/strings', stringController.getAllStringStats);

// 4. Natural Language Filtering
router.get('/strings/filter-by-natural-language', stringController.getNaturalLanguageStats);

// 5. Delete a specific string by its value
router.delete('/strings/:string_value', stringController.deleteStringStat);

module.exports = router;

