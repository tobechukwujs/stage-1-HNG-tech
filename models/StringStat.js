const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// We use 'StringStat' to avoid conflict with the native 'String' object
const StringStat = sequelize.define('StringStat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT, // Use TEXT for potentially long strings
    allowNull: false,
    comment: 'The original string value'
  },
  // We store the sha256_hash at the top level for easy lookup and uniqueness
  sha256_hash: {
    type: DataTypes.STRING(64), // SHA-256 hash is 64 hex characters
    allowNull: false,
    unique: true, // This enforces the 409 Conflict requirement
    comment: 'SHA-256 hash of the value'
  },
  // All other properties are stored in a single JSONB column
  properties: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Computed properties of the string'
  }
  // createdAt and updatedAt are automatically added by Sequelize
}, {
  tableName: 'string_stats',
  timestamps: true, // This will add createdAt and updatedAt fields
  updatedAt: false, // We only care about createdAt
});

module.exports = StringStat;
