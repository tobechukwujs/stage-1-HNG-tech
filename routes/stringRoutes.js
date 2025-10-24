const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');


router.get('/strings/filter-by-natural-language', stringController.getNaturalLanguageStats);

router.get('/strings', stringController.getAllStringStats);

router.post('/strings', stringController.createStringStat);

router.get('/strings/:string_value', stringController.getStringStat);

router.delete('/strings/:string_value', stringController.deleteStringStat);

module.exports = router;
