const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class OrderItem extends Model {}

  OrderItem.init(
    {
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OrderItem',
    }
  );

  return OrderItem;
};
