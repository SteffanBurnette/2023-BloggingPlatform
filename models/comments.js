'use strict';
const { Model} = require('sequelize');
//const { Users, Posts  } = require("./models");
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Posts, { foreignKey: 'postId' });
      //This is the other half of the one-to-many relationship that lets the program know
      //that comments belongs to posts.
      //this.belongsTo(models.Users);
    }
  }
  Comments.init({
    content: DataTypes.STRING,
   
  }, {
    sequelize,
    modelName: 'Comments',
    tableName:'Comments',
  });
  return Comments;
};