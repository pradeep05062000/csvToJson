const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const users = sequelize.define('users', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    address:DataTypes.JSONB,
    additional_info:DataTypes.JSONB
},{
    timestamps: false // Ensure this setting is here to prevent Sequelize from adding createdAt and updatedAt columns
});

module.exports = users

