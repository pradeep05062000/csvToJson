const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

let DB_NAME = process.env.DB_NAME;
let DB_USERNAME = process.env.DB_USERNAME;
let DB_PASSWORD = process.env.DB_PASSWORD;
let DB_HOST = process.env.DB_HOST;
let DB_PORT = process.env.DB_PORT;

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  port: DB_PORT, 
  logging: false
});


module.exports = sequelize;