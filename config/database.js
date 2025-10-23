const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with the database URL from .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    // Add SSL options if required by your hosting provider (e.g., Railway, Heroku)
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false 
    // }
  }
});

module.exports = { sequelize };
