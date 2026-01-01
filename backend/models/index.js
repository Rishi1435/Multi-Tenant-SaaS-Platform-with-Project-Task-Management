const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config.js')[process.env.NODE_ENV || 'development'];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Manual Import of Models to ensure order and clarity
db.Tenant = require('./tenant')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Project = require('./project')(sequelize, Sequelize);
db.Task = require('./task')(sequelize, Sequelize);
db.AuditLog = require('./auditLog')(sequelize, Sequelize);

// Setup Associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;