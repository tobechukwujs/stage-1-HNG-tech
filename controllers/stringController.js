const StringStat = require('../models/StringStat');
const { analyzeString, buildWhereClause, parseNaturalLanguageQuery } = require('../utils/stringHelpers');
const { Sequelize, Op } = require('sequelize');

/**
 * 1. Create/Analyze String
 * POST /strings
 */
exports.createStringStat = async (req, res) => {
  try {
    const { value } = req.body;

    // 400 Bad Request: Invalid request body or missing "value" field
    if (!value) {
      return res.status(400).json({ error: 'Invalid request body or missing "value" field' });
    }

    // 422 Unprocessable Entity: Invalid data type for "value"
    if (typeof value !== 'string') {
      return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
    }

    // Compute all properties
    const properties = analyzeString(value);

    // Create the record in the database
    const newStringStat = await StringStat.create({
      value: value,
      sha256_hash: properties.sha256_hash,
      properties: properties, // Store the full object in the JSONB column
    });

    // 201 Created: Return the success response
    return res.status(201).json({
      id: newStringStat.id, // Using the auto-generated UUID
      value: newStringStat.value,
      properties: newStringStat.properties,
      created_at: newStringStat.createdAt.toISOString()
    });

  } catch (error) {
    // 409 Conflict: String already exists (detected by unique constraint on sha256_hash)
    if (error instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).json({ error: 'String already exists in the system' });
    }

    // Generic server error
    console.error('Error in createStringStat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// 2. Get Specific String
// GET /strings/{string_value}
exports.getStringStat = async (req, res) => {
  try {
    const { string_value } = req.params;

    // Find the string stat by its 'value' field
    const stringStat = await StringStat.findOne({
      where: { value: string_value }
    });

    // 404 Not Found: String does not exist
    if (!stringStat) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    // 200 OK: Return the success response
    return res.status(200).json({
      id: stringStat.id,
      value: stringStat.value,
      properties: stringStat.properties,
      created_at: stringStat.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Error in getStringStat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Get All Strings with Filtering
// GET /strings
exports.getAllStringStats = async (req, res) => {
  try {
    // Build the where clause from query parameters
    const { whereClause, appliedFilters, validationError } = buildWhereClause(req.query);

    // 400 Bad Request: Invalid query parameter values
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Find all records that match the where clause
    const { count, rows } = await StringStat.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'value', 'properties', 'createdAt'], // Select specific fields
      order: [['createdAt', 'DESC']] // Order by creation date
    });

    // 200 OK: Format and return the response
    const responseData = rows.map(stat => ({
      id: stat.id,
      value: stat.value,
      properties: stat.properties,
      created_at: stat.createdAt.toISOString()
    }));

    return res.status(200).json({
      data: responseData,
      count: count,
      filters_applied: appliedFilters
    });

  } catch (error) {
    console.error('Error in getAllStringStats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Natural Language Filtering
// GET /filter-by-natural-language
exports.filterByNaturalLanguage = async (req, res) => {
  try {
    const { query } = req.query;

    // 400 Bad Request: Missing query
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "query" parameter.' });
    }
    
    // 1. Parse the natural language query into a filter object
    const parsedFilters = parseNaturalLanguageQuery(query);

    // 422 Unprocessable Entity: Conflicting filters
    if (parsedFilters.conflict) {
      return res.status(422).json({ error: 'Query parsed but resulted in conflicting filters' });
    }

    // 400 Bad Request: Unable to parse
    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({ error: 'Unable to parse natural language query' });
    }

    // 2. Build the where clause from the parsed filters
    const { whereClause, appliedFilters, validationError } = buildWhereClause(parsedFilters);

    if (validationError) {
      // This should ideally not happen if parseNaturalLanguageQuery is correct
      return res.status(400).json({ error: `Parsing error: ${validationError}` });
    }

    // 3. Find matching records
    const { count, rows } = await StringStat.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'value', 'properties', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // 4. Format and return the response
    const responseData = rows.map(stat => ({
      id: stat.id,
      value: stat.value,
      properties: stat.properties,
      created_at: stat.createdAt.toISOString()
    }));

    return res.status(200).json({
      data: responseData,
      count: count,
      interpreted_query: {
        original: query,
        parsed_filters: appliedFilters
      }
    });

  } catch (error) {
    console.error('Error in filterByNaturalLanguage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 5. Delete String
// DELETE /strings/{string_value}
exports.deleteStringStat = async (req, res) => {
  try {
    const { string_value } = req.params;

    // Attempt to delete the record by its 'value'
    const deletedCount = await StringStat.destroy({
      where: { value: string_value }
    });

    // 404 Not Found: String does not exist
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    // 204 No Content: Success
    return res.status(204).send();

  } catch (error) {
    console.error('Error in deleteStringStat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};