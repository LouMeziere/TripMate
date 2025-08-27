const { sequelize } = require('../models');

async function initDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: true }); // WARNING: This drops all tables!
    console.log('Database synced successfully. All tables created.');
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Export the function
module.exports = { initDatabase };

// If this file is run directly, initialize the database
if (require.main === module) {
  initDatabase().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}
