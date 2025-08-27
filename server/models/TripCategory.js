const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripCategory = sequelize.define('TripCategory', {
  tripId: {
    type: DataTypes.INTEGER,
    field: 'trip_id',
    references: {
      model: 'trips',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'trip_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Only track creation time for junction table
});

module.exports = TripCategory;
