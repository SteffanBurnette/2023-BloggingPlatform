const express = require("express");
const app = express();
const port = 4000;
const bcrypt=require("bcryptjs");
const session = require('express-session');
const {Users, Comments, Posts} = require("./models");
require("dotenv").config();

app.use(express.json());
//Used to save a users session.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000 // 1 hour
    },
  }));


  app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    res.on("finish", () => {
      // the 'finish' event will be emitted when the response is handed over to the OS
      console.log(`Response Status: ${res.statusCode}`);
    });
    next();
  });


//Defines authenticated user
  const authenticateUser = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'You must be logged in to view this page.' });
    }
    next();
  }; 







//Login/Logout/SignUp
//#############################################################################################
//BCRYPT SIGN UP
app.post("/signup", async (req, res) => {
    //Hashes the inputted password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
    //Creates a user and inputs the hashedpassword into its password field
    try {
      const user = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
    //Sends the 201 message if the user is created
      res.status(201).json({
        message: "User created!",
        user: {
          name: user.name,
          email: user.email,
        }
      })
    } catch (error) {//Sends a error if the user is not created
      if (error.name === "SequelizeValidationError") {
        return res
          .status(422)
          .json({ errors: error.errors.map((e) => e.message) });
      }
      console.error(error);
      res.status(500).json({
        message: "Error occurred while creating a new user account"
      })
    }
  })
  
  
   //BCRYPTJSSSSSSS Login
  app.post('/login', async (req, res) => {
    try {
      // First, find the user by their email address
      const user = await Users.findOne({ where: { email: req.body.email } });
  
      if (user === null) {
        // If the user isn't found in the database, return an 'incorrect credentials' message
        return res.status(401).json({
          message: 'Incorrect credentials',
        });
      }
  
      // If the user is found, we then use bcrypt to check if the password in the request matches the hashed password in the database
      bcrypt.compare(req.body.password, user.password, (error, result) => {
        if (result) {
          // Passwords match

          // TODO: Create a session for this user
//The req.session.userId line is storing the user's id in the session. The session data is stored server-side.
        req.session.userId = user.id;
  
        //Returns login successfully status
          res.status(200).json({
            message: 'Logged in successfully',
            user: {
              name: user.name,
              email: user.email,
            },
          });
        } else {
          // Passwords don't match
          res.status(401).json({ message: 'Incorrect credentials' });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during the login process' });
    }
  });
  
  //LOGOUT THE USER
  //req.session.destroy() destroys the session. It takes a callback that will be run 
  //after the session gets destroyed. The callback takes an error as its argument, if any occurred.
  app.delete('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.sendStatus(500);
        }

        res.clearCookie('connect.sid');
        return res.sendStatus(200);
    });
});
//####################################################################################################


//POSTSPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOST
// Get all the post
app.get("/posts",authenticateUser, async (req, res) => {
    try {
       // const postids=await Posts.userId;
      //const allPosts = await Posts.findAll({where:{id:postids}});
      const userIds = req.session.userId; // Assuming the authenticated user's ID is stored in req.user.id
      const allPosts = await Posts.findAll({ where: { userId: userIds } });
  
      res.status(200).json(allPosts);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });


// Update a specific post
app.patch("/posts/:id", authenticateUser, async (req, res) => {
    const postId = parseInt(req.params.id, 10);
  
    try {
      const [numberOfAffectedRows, affectedRows] = await Posts.update(
        req.body,
        { where: { id: postId }, returning: true }
      );
  
      if (numberOfAffectedRows > 0) {
        res.status(200).json(affectedRows[0]);
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: err.errors.map((e) => e.message) });
      }
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });
  
    
 // Get a specific post
app.get("/posts/:id",authenticateUser, async (req, res) => {
    const postId = parseInt(req.params.id, 10);
  
    try {
      const post = await Posts.findOne({ where: { id: postId } });
  
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {  
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  }); 

  // Create a new post
app.post("/posts",authenticateUser, async (req, res) => {
    try {
      const newPost = await Posts.create(req.body);
  
      res.status(201).json(newPost);
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: err.errors.map((e) => e.message) });
      }
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });


  // Delete a specific post
app.delete("/posts/:id",authenticateUser, async (req, res) => {
    const postId = parseInt(req.params.id, 10);
  
    try {
      const deleteOp = await Posts.destroy({ where: { id: postId } });
  
      if (deleteOp > 0) {
        res.status(200).send({ message: "Post deleted successfully" });
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });
  
///POSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOSTPOST

//CommentsCommentsCommentsCommentsCommentsCommentsComments
// Get all the comments
app.get("/posts/:id/comments",authenticateUser, async (req, res) => {
    try {
       // const postids=await Posts.userId;
      //const allPosts = await Posts.findAll({where:{id:postids}});
      const userIds = req.session.userId; // Assuming the authenticated user's ID is stored in req.user.id
      const postIds = parseInt(req.params.id, 10);

      const allComments = await Comments.findAll({ where: { postId: postIds } });
  
      res.status(200).json(allComments);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });


// Update a specific post
app.patch("/posts/:id/comments/:cid", authenticateUser, async (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const comId = parseInt(req.params.cid, 10);
  
    try {
      const [numberOfAffectedRows, affectedRows] = await Comments.update(
        req.body,
        { where: { id: comId }, returning: true }
      );
  
      if (numberOfAffectedRows > 0) {
        res.status(200).json(affectedRows[0]);
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: err.errors.map((e) => e.message) });
      }
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });
  
    
 // Get a specific comment
app.get("/posts/:id/comments/:cid",authenticateUser, async (req, res) => {
    const comId = parseInt(req.params.cid, 10);
  
    try {
      const com = await Comments.findOne({ where: { id: comId } });
  
      if (com) {
        res.status(200).json(com);
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {  
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  }); 

  // Create a new Comment
app.post("/posts/:id/comments",authenticateUser, async (req, res) => {
    try {
      const newCom = await Comments.create(req.body);
  
      res.status(201).json(newCom);
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: err.errors.map((e) => e.message) });
      }
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });


  // Delete a specific job
app.delete("/posts/:id/comments/:cid",authenticateUser, async (req, res) => {
    const comId = parseInt(req.params.cid, 10);
  
    try {
      const deleteOp = await Comments.destroy({ where: { id: comId } });
  
      if (deleteOp > 0) {
        res.status(200).send({ message: "Comment deleted successfully" });
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
  