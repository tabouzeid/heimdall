module.exports = function (app) {
  app.get('/', (req, res) => {
    res.render('landing');
  });

  app.get('/inventory', (req, res) => {
    res.render('inventory');
  });
};
