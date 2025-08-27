const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    field: 'end_date'
  },
  travelers: DataTypes.INTEGER,
  budget: DataTypes.STRING,
  pace: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'draft'
  },
  itinerary: {
    type: DataTypes.JSON, // Store activities as JSON initially
    defaultValue: []
  }
}, {
  tableName: 'trips',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Trip;
