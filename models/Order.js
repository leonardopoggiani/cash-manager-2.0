const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Order extends Model {}

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );

  return Order;
};
