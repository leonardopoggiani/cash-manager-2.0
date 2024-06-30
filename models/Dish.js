const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Dish = sequelize.define('Dish', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prezzo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.ENUM('Antipasti', 'Primi', 'Secondi', 'Dolci', 'Pizze', 'Bevande', 'Altro'),
    allowNull: false,
  },
  disponibile: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hasCommonDependency: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Dish;
