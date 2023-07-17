'use strict';
const bcrypt=require("bcryptjs");
//const { User } = require("./models");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

   


    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name:"Steffan",
          email:"Steffan@gmail.com",
          password:await bcrypt.hash("password", 10),//Awaits the inputted hash
          createdAt: new Date(),
          updatedAt: new Date(),
        },
       
    
      ],
      {}
    );

 //I had to wrap the table names in quotes for some reason, even thought it worked fine for me
 //in other projects. I had to do the same in the postgeSql 
    const userss = await queryInterface.sequelize.query(`SELECT id FROM "Users"`);//Gets the id from user
    const userIds = userss[0][0].id;//Sets the id to a variable

    await queryInterface.bulkInsert(
      "Posts",
      [
        {
          content:"The first post",
          userId:userIds,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
       
    
      ],
      {}
    );

   
   const posts = await queryInterface.sequelize.query(`SELECT id FROM "Posts"`);
    const postIds = posts[0][0].id;



    await queryInterface.bulkInsert(
      "Comments",
      [
        {
          content:"The first comment.",
         postId:postIds,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
       
    
      ],
      {}
    );


  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {});
    await queryInterface.bulkDelete("Posts", null, {});
    await queryInterface.bulkDelete("Comments", null, {});
  }
};
