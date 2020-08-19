// Requiring our models and passport as we've configured it
const db = require('../models');
const moment = require('moment');

module.exports = function (app) {
  app.get('/api/product', (req, res) => {
    // return contents of the Product table
    db.Product.findAll().then((products) => {
      res.json(products);
    });
  });

  app.post('/api/product', (req, res) => {
    // add a new row to the Product table
    db.Product.create({
      sku: req.body.sku,
      name: req.body.name,
      description: req.body.description,
      currentPurchasePrice: req.body.currentPurchasePrice,
      currentSalePrice: req.body.currentSalePrice,
      inventoryQuantity: req.body.inventoryQuantity,
      minRequirement: req.body.minRequirement,
    }).then(() => {
      console.log('POST complete');
    });
    res.end();
  });

  app.put('/api/product', (req, res) => {
    // update an existing row in the Product table
    db.Product.update(req.body, {
      where: {
        sku: req.body.sku,
      },
    }).then(() => {
      res.end();
    });
  });

  app.get('/api/product/:sku', (req, res) => {
    // return Product table info for req.params.sku
    // as well as the 3rd party api info for that sku
    const skuParam = req.params.sku;
    db.Product.findOne({
      where: {
        sku: skuParam,
      },
    }).then((row) => {
      res.json(row);
    });
  });

  app.post('/api/order', (req, res) => {
    // create a new entry in the Order table and get the orderId for it
    // add each item in your order to the OrderDetail table with the orderId included on each item
    db.Order.create({
      clientName: req.body.clientName,
      date: moment.now(),      
    }).then((dbRes) => {
      let orderId = dbRes.dataValues.orderId;
      for(order of req.body.details){
        order['orderId'] = orderId;
      }
      db.OrderDetail.bulkCreate(req.body.details).then(() => {
        console.log('bulk adding done');
        res.end();
      });
    });
  });
};
