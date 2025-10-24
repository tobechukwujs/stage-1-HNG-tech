const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');

// IMPORTANT: More specific routes MUST come before parameterized routes

// 4. Natural Language Filtering - MUST be before /:string_value
router.get('/strings/filter-by-natural-language', stringController.getNaturalLanguageStats);

// 3. Get all strings with filtering - MUST be before /:string_value
router.get('/strings', stringController.getAllStringStats);

// 1. Create/Analyze a new string
router.post('/strings', stringController.createStringStat);

// 2. Get a specific string by its value - MUST be after more specific routes
router.get('/strings/:string_value', stringController.getStringStat);

// 5. Delete a specific string by its value
router.delete('/strings/:string_value', stringController.deleteStringStat);

module.exports = router;
