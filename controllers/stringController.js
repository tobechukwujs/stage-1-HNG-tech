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
  try {
    const { value } = req.body;

    // Check if value field exists
    if (value === undefined || value === null) {
      return res.status(400).json({ 
        error: 'Invalid request body. Missing "value" field.' 
      });
    }

    // Check if value is a string
    if (typeof value !== 'string') {
      return res.status(422).json({ 
        error: 'Invalid data type for "value". Must be a string.' 
      });
    }

    // Check if value is not empty after trimming
    if (value.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid request body. "value" must be a non-empty string.' 
      });
    }

    // Check for existing string
    const existingString = await StringStat.findOne({ where: { value } });
    if (existingString) {
      return res.status(409).json({ 
        error: 'String already exists in the system'
      });
    }

    // Analyze the string
    const properties = analyzeString(value);
    
    // Create in database
    const newStringStat = await StringStat.create({
      value: value,
      sha256_hash: properties.sha256_hash,
      properties: properties
    });

    // Return the full response
    return res.status(201).json({
      id: newStringStat.sha256_hash,
      value: newStringStat.value,
      properties: newStringStat.properties,
      created_at: newStringStat.createdAt
    });

  } catch (error) {
    console.error('Error in createStringStat:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Get a specific string by its value
exports.getStringStat = async (req, res) => {
  try {
    const { string_value } = req.params;
    
    if (!string_value) {
      return res.status(400).json({ error: 'String value is required' });
    }

    const stringStat = await StringStat.findOne({ where: { value: string_value } });

    if (!stringStat) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    return res.status(200).json({
      id: stringStat.sha256_hash,
      value: stringStat.value,
      properties: stringStat.properties,
      created_at: stringStat.createdAt
    });

  } catch (error) {
    console.error('Error in getStringStat:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Get all strings with filtering
exports.getAllStringStats = async (req, res) => {
  try {
    const { where, filtersApplied } = buildWhereClause(req.query);

    const queryOptions = {
      order: [['createdAt', 'DESC']],
      attributes: ['value', 'sha256_hash', 'properties', 'createdAt']
    };

    if (where) {
      queryOptions.where = where;
    }

    const { rows, count } = await StringStat.findAndCountAll(queryOptions);

    const data = rows.map(stat => ({
      id: stat.sha256_hash,
      value: stat.value,
      properties: stat.properties,
      created_at: stat.createdAt
    }));

    return res.status(200).json({
      data: data,
      count: count,
      filters_applied: filtersApplied 
    });

  } catch (error) {
    console.error('Error in getAllStringStats:', error);
    console.error('Error stack:', error.stack);
    if (error.message && error.message.includes('Invalid query parameter')) {
      return res.status(400).json({ error: 'Invalid query parameter values or types' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Natural Language Filtering
exports.getNaturalLanguageStats = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Missing "query" parameter' });
    }

    const parsedFilters = parseNaturalLanguageQuery(query);

    const { where, filtersApplied } = buildWhereClause(parsedFilters);

    const queryOptions = {
      order: [['createdAt', 'DESC']],
      attributes: ['value', 'sha256_hash', 'properties', 'createdAt']
    };

    if (where) {
      queryOptions.where = where;
    }

    const { rows, count } = await StringStat.findAndCountAll(queryOptions);

    const data = rows.map(stat => ({
      id: stat.sha256_hash,
      value: stat.value,
      properties: stat.properties,
      created_at: stat.createdAt
    }));
    
    return res.status(200).json({
      data: data,
      count: count,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters
      }
    });

  } catch (error) {
    console.error('Error in getNaturalLanguageStats:', error);
    console.error('Error stack:', error.stack);
    if (error.message && (error.message.includes('Unable to parse') || error.message.includes('Conflicting filters'))) {
      const status = error.message.includes('Conflicting') ? 422 : 400;
      return res.status(status).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Delete a specific string by its value
exports.deleteStringStat = async (req, res) => {
  try {
    const { string_value } = req.params;
    
    if (!string_value) {
      return res.status(400).json({ error: 'String value is required' });
    }

    const result = await StringStat.destroy({
      where: { value: string_value }
    });

    if (result === 0) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    return res.status(204).send();

  } catch (error) {
    console.error('Error in deleteStringStat:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error' });
  }
};