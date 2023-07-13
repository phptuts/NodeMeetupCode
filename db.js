const { Sequelize } = require('sequelize');
const createUserModel = require('./user.model');

const sequelize = new Sequelize(process.env.DB_CONNECTION);

const UserModel = createUserModel(sequelize);

module.exports = { sequelize, UserModel };