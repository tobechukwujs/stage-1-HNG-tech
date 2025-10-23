const sequelize = require('../config/database');
const StringStatModel = require('./StringStat');

// Initialize the model
const StringStat = StringStatModel(sequelize);

// Create an object to export
const db = {
  sequelize, // The instance
  Sequelize: sequelize.Sequelize, // The class
  StringStat: StringStat, // Your model
};

module.exports = db;
