console.log("--- V4: Final fix for all routes and logic ---");
const express = require('express');
const { sequelize } = require('./models/StringStat'); // Import from new location
const stringRoutes = require('./routes/stringRoutes');
const dotenv = require('dotenv'); // <--- THIS IS THE FIX

dotenv.config(); // Now this line will work

const app = express();
// Use the dynamic PORT from Railway, or 3001 for local
const port = process.env.PORT || 3001; 

app.use(express.json());

// Base API route
// This is now '/', not '/api', so the bot can find your routes.
app.use('/', stringRoutes);

// Simple root route to show it's running
app.get('/', (req, res) => {
  res.send('String Analyzer API is running!');
});

// Connect to database and start the server
// This will now work, as models are loaded before this is called
sequelize.sync().then(() => {
  console.log('Database connection has been established successfully.');
  console.log('All models were synchronized successfully.');
  
  app.listen(port, () => {
    // FIX: Log the actual port it's running on
    console.log(`Server is running on port ${port}`);
  });

}).catch(err => {
  console.error('Unable to connect to the database:', err);
  process.exit(1); // Exit the process with an error code
});