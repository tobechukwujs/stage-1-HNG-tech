require('dotenv').config();
const express = require('express');
const { sequelize } = require('./config/database');
const stringRoutes = require('./routes/stringRoutes');
const StringStat = require('./models/StringStat');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Parse JSON request bodies
app.use(express.json());

// --- Routes ---

app.use('/api', stringRoutes); // You can prefix with /api or not
app.use('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the String Analyzer API' });
});


async function startServer() {
  try {

    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

 
    await sequelize.sync({ alter: true }); 
    console.log('All models were synchronized successfully.');

    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); 
  }
}

startServer();
