const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Analyzes a string and computes all required properties.
 * @param {string} text - The input string to analyze.
 * @returns {object} An object containing all computed properties.
 */
function analyzeString(text) {
  // ... [existing analyzeString function code] ...
  const length = text.length;
  
  // Case-insensitive palindrome check
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const is_palindrome = normalizedText.length > 0 && normalizedText === [...normalizedText].reverse().join('');

  // Word count (splits by any whitespace)
  const words = text.trim().split(/\s+/);
  const word_count = words[0] === '' ? 0 : words.length;

  // Unique characters
  const unique_characters = new Set(text).size;

  // SHA-256 Hash
  const sha256_hash = crypto.createHash('sha256').update(text).digest('hex');

  // Character frequency map
  const character_frequency_map = {};
  for (const char of text) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map
  };
}

/**
 * Builds a Sequelize where clause from a filter object.
 * @param {object} filters - An object containing filter keys and values (e.g., req.query).
 * @returns {object} An object containing { whereClause, appliedFilters, validationError }.
 */
function buildWhereClause(filters) {
  const whereClause = {};
  const propertiesWhereClause = {};
  const appliedFilters = {};
  
  // is_palindrome: boolean (true/false)
  if (filters.is_palindrome !== undefined) {
    if (filters.is_palindrome !== 'true' && filters.is_palindrome !== 'false') {
      return { validationError: 'Invalid value for is_palindrome. Must be true or false.' };
    }
    propertiesWhereClause.is_palindrome = (filters.is_palindrome === 'true');
    appliedFilters.is_palindrome = propertiesWhereClause.is_palindrome;
  }

  // min_length: integer
  let lengthFilter = {};
  if (filters.min_length !== undefined) {
    const minLength = parseInt(filters.min_length, 10);
    if (isNaN(minLength)) {
      return { validationError: 'Invalid value for min_length. Must be an integer.' };
    }
    lengthFilter[Op.gte] = minLength;
    appliedFilters.min_length = minLength;
  }

  // max_length: integer
  if (filters.max_length !== undefined) {
    const maxLength = parseInt(filters.max_length, 10);
    if (isNaN(maxLength)) {
      return { validationError: 'Invalid value for max_length. Must be an integer.' };
    }
    lengthFilter[Op.lte] = maxLength;
    appliedFilters.max_length = maxLength;
  }

  if (Object.keys(lengthFilter).length > 0) {
    propertiesWhereClause.length = lengthFilter;
  }

  // word_count: integer
  if (filters.word_count !== undefined) {
    const wordCount = parseInt(filters.word_count, 10);
    if (isNaN(wordCount)) {
      return { validationError: 'Invalid value for word_count. Must be an integer.' };
    }
    propertiesWhereClause.word_count = wordCount;
    appliedFilters.word_count = wordCount;
  }

  // contains_character: string (single character)
  if (filters.contains_character !== undefined) {
    const char = filters.contains_character;
    if (typeof char !== 'string' || char.length === 0) {
      return { validationError: 'Invalid value for contains_character. Must be a string.' };
    }
    // This queries the JSONB character_frequency_map
    // e.g., properties.character_frequency_map['a'] > 0
    propertiesWhereClause[`character_frequency_map.${char}`] = { [Op.gt]: 0 };
    appliedFilters.contains_character = char;
  }

  // Assign the properties filter to the main where clause
  if (Object.keys(propertiesWhereClause).length > 0) {
    whereClause.properties = propertiesWhereClause;
  }

  return { whereClause, appliedFilters, validationError: null };
}

/**
 * Parses a natural language query into a filter object.
 * @param {string} query - The natural language query string.
 * @returns {object} A filter object compatible with buildWhereClause.
 */
function parseNaturalLanguageQuery(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('palindromic') || lowerQuery.includes('palindrome')) {
    filters.is_palindrome = 'true';
  }

  if (lowerQuery.includes('single word')) {
    filters.word_count = '1';
  }

  const longerMatch = lowerQuery.match(/longer than (\d+) characters/);
  if (longerMatch && longerMatch[1]) {
    // "longer than 10" means min_length = 11
    filters.min_length = (parseInt(longerMatch[1], 10) + 1).toString();
  }

  if (lowerQuery.includes('first vowel')) {
    filters.contains_character = 'a';
  }

  const letterMatch = lowerQuery.match(/containing the letter "([^"]+)"/i); // e.g., "a"
  if (letterMatch && letterMatch[1]) {
    filters.contains_character = letterMatch[1].toLowerCase();
  } else {
    // Fallback for ...containing the letter z (without quotes)
    const simpleLetterMatch = lowerQuery.match(/containing the letter ([a-z])$/i);
    if (simpleLetterMatch && simpleLetterMatch[1]) {
      filters.contains_character = simpleLetterMatch[1].toLowerCase();
    }
  }

  // Check for conflicting filters (basic example)
  if (lowerQuery.includes('palindromic') && lowerQuery.includes('not palindromic')) {
    filters.conflict = true; // Mark as conflicting
  }

  return filters;
}

module.exports = { 
  analyzeString,
  buildWhereClause,
  parseNaturalLanguageQuery
};

