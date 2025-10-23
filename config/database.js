require('dotenv').config(); // Loads .env file for local development
const { Sequelize } = require('sequelize');

// Get the database URL from environment variables
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is not set!");
}

// Check if we are in production (Railway sets this to 'production')
const isProduction = process.env.NODE_ENV === 'production';

// Define Sequelize options
const options = {
  dialect: 'postgres',
  logging: false, // Turn off query logging in production
};

// Add SSL configuration ONLY for production (this is the fix)
if (isProduction) {
  options.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false // This allows it to connect on Railway/Heroku
    }
  };
}

const sequelize = new Sequelize(dbUrl, options);

module.exports = sequelize;