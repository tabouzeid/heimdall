// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
const express = require('express');
const exphbs = require('express-handlebars');

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Set Handlebars as the default templating engine.
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('./routes/api-routes')(app);
require('./routes/html-routes')(app);

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
