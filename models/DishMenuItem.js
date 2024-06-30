const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const DishMenuItem = sequelize.define('DishMenuItem', {
  quantita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  isCommonDependency: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = DishMenuItem;
