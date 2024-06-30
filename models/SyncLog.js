const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SyncLog extends Model {}
  SyncLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      node_address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      last_sync: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'SyncLog',
    }
  );
  return SyncLog;
};
