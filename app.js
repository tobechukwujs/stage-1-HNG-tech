require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const stringRoutes = require('./routes/stringRoutes');

const app = express();
// FIX: Use the PORT environment variable provided by Railway, or 3000 as a fallback
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
app.use('/api', stringRoutes);

// Base route to check if server is up
app.get('/', (req, res) => {
  res.send('String Analyzer API is running!');
});

// Error handling middleware (optional but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to database and start the server
sequelize.sync().then(() => {
  console.log('Database connection has been established successfully.');
  console.log('All models were synchronized successfully.');
  
  app.listen(port, () => {
    // FIX: Log the actual port it's running on
    console.log(`Server is running on port ${port}`);
  });

}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
