// Import the StringStat model from the new destructured export
const { StringStat } = require('../models/StringStat');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { 
  analyzeString, 
  buildWhereClause, 
  parseNaturalLanguageQuery 
} = require('../utils/stringHelpers');

// 1. Create/Analyze a new string
exports.createStringStat = async (req, res) => {
  const { value } = req.body;

  if (typeof value !== 'string' || value.trim() === '') {
    return res.status(400).json({ 
      error: 'Invalid request body. "value" must be a non-empty string.' 
    });
  }

  // 1. Check for existing string (using the value itself, not the hash)
  try {
    const existingString = await StringStat.findOne({ where: { value } });
    if (existingString) {
      return res.status(409).json({ 
        error: 'String already exists in the system',
        data: existingString
      });
    }

    // 2. Analyze the string
    const properties = analyzeString(value);
    
    // 3. Create in database
    const newStringStat = await StringStat.create({
      value: value,
      sha256_hash: properties.sha256_hash,
      properties: properties
    });

    // 4. Return the full response
    res.status(201).json({
      id: newStringStat.sha256_hash,
      value: newStringStat.value,
      properties: newStringStat.properties,
      created_at: newStringStat.createdAt
    });

  } catch (error) {
    console.error('Error in createStringStat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Get a specific string by its value
exports.getStringStat = async (req, res) => {
  try {
    const { string_value } = req.params;
    const stringStat = await StringStat.findOne({ where: { value: string_value } });

    if (!stringStat) {
      // FIX: Changed status code from 44 to 404
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    res.status(200).json({
      id: stringStat.sha256_hash,
      value: stringStat.value,
      properties: stringStat.properties,
      created_at: stringStat.createdAt
    });

  } catch (error) {
    console.error('Error in getStringStat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Get all strings with filtering
exports.getAllStringStats = async (req, res) => {
  try {
    // Build the where clause from query parameters
    const where = buildWhereClause(req.query);

    const { rows, count } = await StringStat.findAndCountAll({
      where: where,
      order: [['createdAt', 'DESC']],
      attributes: ['value', 'sha256_hash', 'properties', 'createdAt']
    });

    // Format the response data
    const data = rows.map(stat => ({
      id: stat.sha256_hash,
      value: stat.value,
      properties: stat.properties,
      created_at: stat.createdAt
    }));

    res.status(200).json({
      data: data,
      count: count,
      filters_applied: req.query 
    });

  } catch (error) { // <-- THIS IS THE FIX. The stray '_' is removed.
    console.error('Error in getAllStringStats:', error);
    // Handle specific error for bad query parameters
    if (error.message.includes('Invalid query parameter')) {
      return res.status(400).json({ error: 'Invalid query parameter values or types' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Natural Language Filtering
exports.getNaturalLanguageStats = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  try {
    // 1. Parse the natural language query
    const parsedFilters = parseNaturalLanguageQuery(query);

    // 2. Build the where clause from the parsed filters
    const where = buildWhereClause(parsedFilters);

    // 3. Fetch data from the database
    const { rows, count } = await StringStat.findAndCountAll({
      where: where,
      order: [['createdAt', 'DESC']],
      attributes: ['value', 'sha256_hash', 'properties', 'createdAt']
    });

    // 4. Format the response
    const data = rows.map(stat => ({
      id: stat.sha256_hash,
      value: stat.value,
      properties: stat.properties,
      created_at: stat.createdAt
    }));
    
    res.status(200).json({
      data: data,
      count: count,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters
      }
    });

  } catch (error) {
    console.error('Error in getNaturalLanguageStats:', error);
    if (error.message.includes('Unable to parse') || error.message.includes('Conflicting filters')) {
      const status = error.message.includes('Conflicting') ? 422 : 400;
      return res.status(status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Delete a specific string by its value
exports.deleteStringStat = async (req, res) => {
  try {
    const { string_value } = req.params;
    const result = await StringStat.destroy({
      where: { value: string_value }
    });

    if (result === 0) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    // FIX: Corrected the res..send() typo
    res.status(204).send(); // 204 No Content

  } catch (error) {
    console.error('Error in deleteStringStat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

