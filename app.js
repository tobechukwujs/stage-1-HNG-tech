console.log("--- V4: Final fix for all routes and logic ---");
const express = require('express');
const { sequelize } = require('./models/StringStat');
const stringRoutes = require('./routes/stringRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; 

app.use(express.json());

// CRITICAL FIX: Routes should be under /api, not root
app.use('/api', stringRoutes);

// Simple root route
app.get('/', (req, res) => {
  res.send('String Analyzer API is running!');
});

// Connect to database and start the server
sequelize.sync().then(() => {
  console.log('Database connection has been established successfully.');
  console.log('All models were synchronized successfully.');
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

}).catch(err => {
  console.error('Unable to connect to the database:', err);
  process.exit(1);
});