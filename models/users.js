'use strict';
const {Model} = require('sequelize');
//const { Users, Comments, Posts  } = require("./models");

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Posts, {as: 'posts', foreignKey:'userId'});//Creates a one-to-many relationship between users and posts
      //Allows user to have many posts
    }
  }
  Users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users',
    tableName:'Users',
  });
  return Users;
};