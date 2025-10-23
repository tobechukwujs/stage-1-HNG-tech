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

// Add SSL configuration ONLY for production, if needed.
// Railway's internal networking often doesn't require SSL,
// but many other production DBs do. We'll start WITHOUT it,
// as that's the most likely fix.
if (isProduction) {
  // We'll assume Railway's internal network doesn't need SSL.
  // If this still fails, we would add dialectOptions here.
}

const sequelize = new Sequelize(dbUrl, options);

module.exports = sequelize;