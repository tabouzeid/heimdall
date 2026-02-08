// Requiring our models and passport as we've configured it
const fetch = require('node-fetch');
const db = require('../models');
const { validateProduct, validateOrder } = require('../middleware/validation');

module.exports = function (app) {
  // Get all products
  app.get('/api/product', async (req, res) => {
    try {
      const products = await db.Product.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        error: 'Failed to fetch products',
        message: error.message,
      });
    }
  });

  // Create new product
  app.post('/api/product', validateProduct, async (req, res) => {
    try {
      // Check if SKU already exists
      const existingProduct = await db.Product.findOne({
        where: { sku: req.body.sku },
      });

      if (existingProduct) {
        return res.status(409).json({
          error: 'Product already exists',
          message: `A product with SKU '${req.body.sku}' already exists`,
        });
      }

      await db.Product.create({
        sku: req.body.sku,
        name: req.body.name,
        description: req.body.description,
        currentPurchasePrice: req.body.currentPurchasePrice,
        currentSalePrice: req.body.currentSalePrice,
        inventoryQuantity: req.body.inventoryQuantity,
        minRequirement: req.body.minRequirement || 0,
      });

      return res.status(201).json({
        message: 'Product created successfully',
        sku: req.body.sku,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        error: 'Failed to create product',
        message: error.message,
      });
    }
  });

  // Update existing product
  app.put('/api/product', validateProduct, async (req, res) => {
    try {
      const [updateCount] = await db.Product.update(req.body, {
        where: {
          sku: req.body.sku,
        },
      });

      if (updateCount === 0) {
        return res.status(404).json({
          error: 'Product not found',
          message: `No product found with SKU '${req.body.sku}'`,
        });
      }

      return res.status(200).json({
        message: 'Product updated successfully',
        sku: req.body.sku,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({
        error: 'Failed to update product',
        message: error.message,
      });
    }
  });

  // Get single product by SKU
  app.get('/api/product/:sku', async (req, res) => {
    try {
      const skuParam = req.params.sku;

      if (!skuParam || skuParam.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid SKU',
          message: 'SKU parameter is required',
        });
      }

      const product = await db.Product.findOne({
        where: {
          sku: skuParam,
        },
      });

      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
          message: `No product found with SKU '${skuParam}'`,
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({
        error: 'Failed to fetch product',
        message: error.message,
      });
    }
  });

  // Create new order
  app.post('/api/order', validateOrder, async (req, res) => {
    try {
      // Create order entry
      const orderRow = await db.Order.create({
        date: new Date(),
      });

      // Add orderId to each item
      const orderItems = req.body.map((item) => ({
        ...item,
        orderId: orderRow.dataValues.orderId,
      }));

      // Bulk create order details
      await db.OrderDetail.bulkCreate(orderItems);

      // Update inventory quantities for each item
      const inventoryUpdates = orderItems.map(async (item) => {
        const product = await db.Product.findOne({
          where: { sku: item.sku },
        });

        if (!product) {
          throw new Error(`Product with SKU '${item.sku}' not found`);
        }

        let newQuantity;
        if (item.buyOrSell === 'Buy') {
          // Buying increases inventory
          newQuantity = product.inventoryQuantity + parseInt(item.quantity, 10);
        } else if (item.buyOrSell === 'Sell') {
          // Selling decreases inventory
          newQuantity = product.inventoryQuantity - parseInt(item.quantity, 10);
          
          // Check if we have enough inventory
          if (newQuantity < 0) {
            throw new Error(`Insufficient inventory for SKU '${item.sku}'. Available: ${product.inventoryQuantity}, Requested: ${item.quantity}`);
          }
        }

        // Update the product inventory
        await db.Product.update(
          { inventoryQuantity: newQuantity },
          { where: { sku: item.sku } },
        );
      });

      // Wait for all inventory updates to complete
      await Promise.all(inventoryUpdates);

      return res.status(201).json({
        message: 'Order created successfully',
        orderId: orderRow.dataValues.orderId,
        itemCount: orderItems.length,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        error: 'Failed to create order',
        message: error.message,
      });
    }
  });

  // BestBuy API proxy endpoint
  app.get('/api/bestbuy/search/:category', async (req, res) => {
    try {
      const { category } = req.params;

      // Check if API key is configured
      if (!process.env.BESTBUY_API_KEY) {
        return res.status(500).json({
          error: 'BestBuy API not configured',
          message: 'BESTBUY_API_KEY environment variable is not set',
        });
      }

      if (!category || category.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'Category parameter is required',
        });
      }

      // Make request to BestBuy API
      const apiUrl = `https://api.bestbuy.com/v1/products((categoryPath.id=${category}))?apiKey=${process.env.BESTBUY_API_KEY}&sort=image.asc&show=categoryPath.name,image,name,salePrice,shortDescription,sku,thumbnailImage&format=json&pageSize=100`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        return res.status(response.status).json({
          error: 'BestBuy API error',
          message: `BestBuy API returned status ${response.status}`,
        });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error calling BestBuy API:', error);
      return res.status(500).json({
        error: 'Failed to fetch BestBuy data',
        message: error.message,
      });
    }
  });
};
