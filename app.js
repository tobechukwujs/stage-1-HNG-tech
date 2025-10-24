console.log("--- V5: Railway deployment fix ---");
const express = require('express');
const { sequelize } = require('./models/StringStat');
const stringRoutes = require('./routes/stringRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint - BEFORE other routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'String Analyzer API is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', stringRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Connect to database and start the server
sequelize.sync()
  .then(() => {
    console.log('Database connection has been established successfully.');
    console.log('All models were synchronized successfully.');
    
    // CRITICAL: Bind to 0.0.0.0 for Railway
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});