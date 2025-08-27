const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/tripmate.db',
  logging: console.log // See SQL queries for debugging
});

module.exports = sequelize;
