const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Dish extends Model {}
  Dish.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
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
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Dish',
      hooks: {
        beforeUpdate: (dish) => {
          dish.updated_at = new Date();
        },
      },
    }
  );
  return Dish;
};
