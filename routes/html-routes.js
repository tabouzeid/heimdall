module.exports = function (app) {
  app.get('/', (req, res) => {
    res.render('landing');
  });

  app.get('/inventory', (req, res) => {
    res.render('inventory');
  });

  // a new route is created to manage a seperate newOrder.handlebars file.
  app.get('/newOrder', (req, res) => {
      res.render('newOrder');
  });
};
