const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MenuItem extends Model {}
  MenuItem.init(
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
      quantita: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoria: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'MenuItem',
      hooks: {
        beforeUpdate: (menuItem) => {
          menuItem.updated_at = new Date();
        },
      },
    }
  );
  return MenuItem;
};
