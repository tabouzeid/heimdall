module.exports = function (sequelize, DataTypes) {
  const Product = sequelize.define('Product', {
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      validate: {
        len: [1],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1],
      },
    },
    inventoryQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currentPurchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currentSalePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minRequirement: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return Product;
};
