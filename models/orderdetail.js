module.exports = function (sequelize, DataTypes) {
  const OrderDetail = sequelize.define('OrderDetail', {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    buyOrSell: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pricePerUnit: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  });

  OrderDetail.associate = function (models) {
    OrderDetail.belongsTo(models.Order, {
      foreignKey: 'orderId',
    });
    OrderDetail.belongsTo(models.Product, {
      foreignKey: 'sku',
    });
  };

  return OrderDetail;
};
