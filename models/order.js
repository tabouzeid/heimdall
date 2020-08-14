module.exports = function (sequelize, DataTypes) {
  const Order = sequelize.define('Order', {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        len: [1],
      },
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
  });
  return Order;
};
