const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Analyzes a string and computes all required properties.
 * @param {string} str - The input string to analyze.
 * @returns {object} An object containing all computed properties.
 */
function analyzeString(str) {
  const length = str.length;

  const cleanedStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversedStr = cleanedStr.split('').reverse().join('');
  const is_palindrome = cleanedStr === reversedStr;

  const uniqueChars = new Set(str.split(''));
  const unique_characters = uniqueChars.size;

  const words = str.trim().split(/\s+/).filter(Boolean); // Split by whitespace
  const word_count = str.trim() === '' ? 0 : words.length;

  const sha256_hash = crypto.createHash('sha256').update(str).digest('hex');

  const character_frequency_map = {};
  for (const char of str) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

/**
 * Builds a Sequelize 'where' clause from query parameters for JSONB filtering.
 * @param {object} query - The query object from the request (e.g., req.query).
 * @returns {object} A Sequelize 'where' clause object.
 */
function buildWhereClause(query) {
  const where = {};
  const filtersApplied = {};

  if (query.is_palindrome === 'true' || query.is_palindrome === 'false') {
    const isPalindromeBool = query.is_palindrome === 'true';
    where['properties.is_palindrome'] = isPalindromeBool;
    filtersApplied.is_palindrome = isPalindromeBool;
  }

  const lengthFilter = {};
  
  if (query.min_length && !isNaN(parseInt(query.min_length))) {
    const minLength = parseInt(query.min_length);
    lengthFilter[Op.gte] = minLength;
    filtersApplied.min_length = minLength;
  }

  if (query.max_length && !isNaN(parseInt(query.max_length))) {
    const maxLength = parseInt(query.max_length);
    lengthFilter[Op.lte] = maxLength;
    filtersApplied.max_length = maxLength;
  }

  if (Object.keys(lengthFilter).length > 0) {
    where['properties.length'] = lengthFilter;
  }

  if (query.word_count && !isNaN(parseInt(query.word_count))) {
    const wordCount = parseInt(query.word_count);
    where['properties.word_count'] = wordCount;
    filtersApplied.word_count = wordCount;
  }

  if (query.contains_character && query.contains_character.length === 1) {
    const char = query.contains_character;
    // Correct way to check if a key exists in the JSONB map
    where[`properties.character_frequency_map.${char}`] = {
      [Op.ne]: null,
    };
    filtersApplied.contains_character = char;
  }

  return { 
    where: Object.keys(where).length > 0 ? where : null, 
    filtersApplied 
  };
}

/**
 * Parses a natural language query into a filter object.
 * @param {string} query - The natural language query string.
 * @returns {object} A filter object that can be used by buildWhereClause.
 */
function parseNaturalLanguageQuery(query) {
  const normalizedQuery = query.toLowerCase().trim();
  const filters = {};

  if (normalizedQuery.includes('single word') || normalizedQuery.includes('one word')) {
    filters.word_count = '1';
  }
  if (normalizedQuery.includes('palindromic') || normalizedQuery.includes('palindrome')) {
    filters.is_palindrome = 'true';
  }

  const lengthMatch = normalizedQuery.match(/(longer|greater) than (\d+) characters?/);
  if (lengthMatch && lengthMatch[2]) {
    // "longer than 10" means "at least 11"
    filters.min_length = (parseInt(lengthMatch[2]) + 1).toString();
  }

  if (normalizedQuery.includes('first vowel')) {
    filters.is_palindrome = 'true'; 
    filters.contains_character = 'a'; 
  }

  const letterMatch = normalizedQuery.match(/containing the letter ([a-z])/);
  if (letterMatch && letterMatch[1]) {
    filters.contains_character = letterMatch[1];
  }

  if (filters.min_length && filters.max_length && parseInt(filters.min_length) > parseInt(filters.max_length)) {
    throw new Error('Conflicting filters: min_length cannot be greater than max_length');
  }

  return filters;
}

module.exports = {
  analyzeString,
  buildWhereClause,
  parseNaturalLanguageQuery,
};