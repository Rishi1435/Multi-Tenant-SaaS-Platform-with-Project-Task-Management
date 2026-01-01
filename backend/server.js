require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./utils/dbInit');
const db = require('./models'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Start Server
const startServer = async () => {
  // Initialize DB (Migrate & Seed)
  await initializeDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

startServer();