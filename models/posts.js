'use strict';
const {Model} = require('sequelize');
//const { Users, Comments  } = require("./models");
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     this.hasMany(models.Comments,  {as: 'comments', foreignKey:'postId'});
      //Creates a one-to-many relationship between posts and comments
      //This means that posts can have multiple comments
      this.belongsTo(models.Users, { foreignKey: 'userId' });
      //This is the other half of the one-to-many relationship that allows the program to know that
      //posts belongs to user
    }
  }
  Posts.init({
    content: DataTypes.STRING,

  }, {
    sequelize,
    modelName: 'Posts',
    tableNAme:"Posts",
  });
  return Posts;
};