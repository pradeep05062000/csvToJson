const express = require('express');
const dotenv = require('dotenv');
const CsvToJsonRouter = require('./Routers/csvToJsonRoute');
const sequelize = require('./db');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;


// Mount Router on the application
app.use(CsvToJsonRouter)

sequelize.sync()
  .then(() => {
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch(err => {
    console.log(err);
  });

