require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const initializeDatabase = require('./utils/dbInit');
const db = require('./models'); // Import models
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Routes
app.use('/api', routes);

// Start Server with Schema Update
const startServer = async () => {
  try {
    // 1. FORCE DATABASE UPDATE
    // This looks at your models and adds any missing columns (like 'pending_plan')
    console.log('⏳ Checking database schema...');
    await db.sequelize.sync({ alter: true }); 
    console.log('✅ Database schema updated successfully!');

    // 2. Run your existing initialization (Seeding, etc.)
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();