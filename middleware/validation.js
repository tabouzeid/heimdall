// Input validation middleware for API routes

/**
 * Validate product data for creation/update
 */
function validateProduct(req, res, next) {
  const {
    sku,
    name,
    description,
    currentPurchasePrice,
    currentSalePrice,
    inventoryQuantity,
    minRequirement,
  } = req.body;

  const errors = [];

  // SKU validation
  if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
    errors.push('SKU is required and must be a non-empty string');
  }

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Product name is required and must be a non-empty string');
  }

  // Description validation
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }

  // Price validation
  const purchasePriceNum = Number(currentPurchasePrice);
  if (
    currentPurchasePrice === undefined
    || currentPurchasePrice === null
    || currentPurchasePrice === ''
    || Number.isNaN(purchasePriceNum)
    || purchasePriceNum < 0
  ) {
    errors.push('Purchase price is required and must be a non-negative number');
  }

  const salePriceNum = Number(currentSalePrice);
  if (
    currentSalePrice === undefined
    || currentSalePrice === null
    || currentSalePrice === ''
    || Number.isNaN(salePriceNum)
    || salePriceNum < 0
  ) {
    errors.push('Sale price is required and must be a non-negative number');
  }

  // Quantity validation
  const quantityNum = Number(inventoryQuantity);
  if (
    inventoryQuantity === undefined
    || inventoryQuantity === null
    || inventoryQuantity === ''
    || Number.isNaN(quantityNum)
    || quantityNum < 0
    || !Number.isInteger(quantityNum)
  ) {
    errors.push('Inventory quantity is required and must be a non-negative integer');
  }

  // Min requirement validation (optional, but if provided must be valid)
  const minReqNum = Number(minRequirement);
  if (
    minRequirement !== undefined
    && minRequirement !== null
    && minRequirement !== ''
    && (Number.isNaN(minReqNum) || minReqNum < 0 || !Number.isInteger(minReqNum))
  ) {
    errors.push('Minimum requirement must be a non-negative integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  return next();
}

/**
 * Validate order data for creation
 */
function validateOrder(req, res, next) {
  const orderItems = req.body;

  // Must be an array
  if (!Array.isArray(orderItems)) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: ['Order must be an array of items'],
    });
  }

  // Must have at least one item
  if (orderItems.length === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: ['Order must contain at least one item'],
    });
  }

  const errors = [];

  orderItems.forEach((item, index) => {
    // Buy or sell validation
    if (!item.buyOrSell || !['Buy', 'Sell'].includes(item.buyOrSell)) {
      errors.push(`Item ${index + 1}: buyOrSell must be either 'Buy' or 'Sell'`);
    }

    // Client name validation
    if (!item.clientName || typeof item.clientName !== 'string' || item.clientName.trim().length === 0) {
      errors.push(`Item ${index + 1}: Client name is required`);
    }

    // SKU validation
    if (!item.sku || typeof item.sku !== 'string' || item.sku.trim().length === 0) {
      errors.push(`Item ${index + 1}: SKU is required`);
    }

    // Quantity validation
    const qtyNum = Number(item.quantity);
    if (
      !item.quantity
      || Number.isNaN(qtyNum)
      || qtyNum <= 0
      || !Number.isInteger(qtyNum)
    ) {
      errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
    }

    // Price per unit validation
    const priceNum = Number(item.pricePerUnit);
    if (
      item.pricePerUnit === undefined
      || item.pricePerUnit === null
      || Number.isNaN(priceNum)
      || priceNum < 0
    ) {
      errors.push(`Item ${index + 1}: Price per unit must be a non-negative number`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  return next();
}

module.exports = {
  validateProduct,
  validateOrder,
};
