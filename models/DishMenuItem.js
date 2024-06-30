const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const DishMenuItem = sequelize.define('DishMenuItem', {
  quantita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

module.exports = DishMenuItem;
