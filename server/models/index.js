const sequelize = require('../config/database');
const Trip = require('./Trip');
const Category = require('./Category');
const TripCategory = require('./TripCategory');

// Define associations
Trip.belongsToMany(Category, {
  through: TripCategory,
  foreignKey: 'tripId',
  otherKey: 'categoryId',
  as: 'categories'
});

Category.belongsToMany(Trip, {
  through: TripCategory,
  foreignKey: 'categoryId',
  otherKey: 'tripId',
  as: 'trips'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Trip,
  Category,
  TripCategory
};
