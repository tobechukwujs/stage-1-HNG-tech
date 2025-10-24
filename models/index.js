const sequelize = require('../config/database');
const StringStatModel = require('./StringStat');

const StringStat = StringStatModel(sequelize);

const db = {
  sequelize, 
  Sequelize: sequelize.Sequelize,
  StringStat: StringStat, 
};

module.exports = db;
