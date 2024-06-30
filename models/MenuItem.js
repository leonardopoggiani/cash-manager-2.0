const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const MenuItem = sequelize.define('MenuItem', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prezzo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  categoria: {
    type: DataTypes.ENUM('Antipasti', 'Primi', 'Secondi', 'Dolci', 'Pizze', 'Bevande', 'Altro'),
    allowNull: false,
  },
});

module.exports = MenuItem;
