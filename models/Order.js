const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Order = sequelize.define('Order', {
  nomeCliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  asporto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gratis: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totale: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = Order;
