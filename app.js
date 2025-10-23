console.log("--- V3: Forcing all local fixes to deploy ---"); // <--- ADD THIS LINE

const express = require('express');
const dotenv = require('dotenv');
// Import sequelize from the model file to fix circular dependency
const { sequelize } = require('./models/StringStat');
const stringRoutes = require('./routes/stringRoutes');

dotenv.config();

const app = express();
// Use the dynamic PORT from Railway or 3000 for local
const port = process.env.PORT || 3001;

app.use(express.json());

// Base API route
app.use('/api', stringRoutes);

// Simple root route
app.get('/', (req, res) => {
  res.send('String Analyzer API is running!');
});

// Connect to database and start the server
// This will now work, as models are loaded before this is called
sequelize.sync().then(() => {
  console.log('Database connection has been established successfully.');
  console.log('All models were synchronized successfully.');
  
  app.listen(port, () => {
    // Log the actual port it's running on
    console.log(`Server is running on port ${port}`);
  });

}).catch(err => {
  console.error('Unable to connect to the database:', err);
  // Exit the process with an error code if the DB connection fails
  process.exit(1); 
});