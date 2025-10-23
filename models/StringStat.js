const { Sequelize, DataTypes } = require('sequelize');
// Import sequelize from config
const sequelize = require('../config/database');

// Define the model
const StringStat = sequelize.define('StringStat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sha256_hash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  properties: {
    type: DataTypes.JSONB,
    allowNull: false
  }
});

// Export BOTH the model AND the sequelize instance
module.exports = { StringStat, sequelize };

