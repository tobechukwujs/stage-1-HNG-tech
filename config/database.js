require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Initializing database configuration...');

const dbUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (!dbUrl) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set!');
  throw new Error("DATABASE_URL environment variable is not set!");
} else {
  // Do not log the full URL for security
  console.log('DATABASE_URL variable is present.');
}

// Define Sequelize options
const options = {
  dialect: 'postgres',
  // Log queries to the console. Remove this in final production.
  logging: (msg) => console.log(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

if (isProduction) {
  console.log('Running in production. Adding SSL config.');
  options.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
} else {
  console.log('Running in development. No SSL config.');
}

let sequelize;

try {
  console.log('Attempting to create new Sequelize instance...');
  sequelize = new Sequelize(dbUrl, options);
  console.log('Sequelize instance created successfully.');
} catch (error) {
  console.error('CRITICAL: Failed to create Sequelize instance:', error);
  throw error; // Re-throw to crash the app, which is correct
}

module.exports = sequelize;
