const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = { StringStat, sequelize };

