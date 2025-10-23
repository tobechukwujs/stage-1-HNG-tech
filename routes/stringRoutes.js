const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');

// --- Define API routes ---

// 1. Create/Analyze String
// POST /strings
router.post('/strings', stringController.createStringStat);

// 2. Get Specific String
// GET /strings/{string_value}
router.get('/strings/:string_value', stringController.getStringStat);

// 3. Get All Strings with Filtering
// GET /strings
router.get('/strings', stringController.getAllStringStats); // Now active

// 4. Natural Language Filtering
// GET /strings/filter-by-natural-language
router.get('/filter-by-natural-language', stringController.filterByNaturalLanguage); // Now active

// 5. Delete String
// DELETE /strings/{string_value}
router.delete('/strings/:string_value', stringController.deleteStringStat); // Now active


module.exports = router;
