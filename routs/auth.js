const express = require("express");
const bcryptjs = require("bcryptjs");
const authRouter = express.Router();
const db = require("../db_conection");
const jwt = require("jsonwebtoken");
const auth = require("../midelwair/auth")

//Sign up rout
authRouter.post("/api/reggister", async (req, res) => {
    try {
        const {user_id, email, password} =  req.body;
        

        if (!user_id || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required!' });
          }

        // Email validation function
        function isValidEmail(email) {
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
            return emailRegex.test(email);
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
            }

        // Check if the email or username already exists
        const userEmailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userEmailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const userIdCheck = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        if (userIdCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        
        // Hash the password
        const salt = bcryptjs.genSaltSync(9); // You can adjust the salt rounds
        const hashedPassword = bcryptjs.hashSync(password, salt);
        
        // Insert the user into the database
        const result = await db.query(
            'INSERT INTO users (user_id, email, password) VALUES ($1, $2, $3) RETURNING *', [user_id, email, hashedPassword]
        );

        // Send response
        const user = result.rows[0];
        console.log(user.user_id + " is created!")

        // create token to stay logd in
        const token = jwt.sign({id: user.user_id}, "secretkey")

        return res.status(201).json({
            msg: 'Reggister successful',
            user_id: user.user_id,
            email: user.email,
            token,
          });

    } catch (e) {
        console.error('Error during registration', e);
        res.status(500).json({ error: 'Somthing whent wrong when registering contact Antoine'});
    }
});

//sine in rout
authRouter.post("/api/login", async (req,res) => {
try {
    const {user_idOrEmail, password} = req.body;

    if (!user_idOrEmail || !password) {
        return res.status(400).json({ error: 'username/email or password are mising!' });
      }

    // Check if the email exists
    const emailChek = await db.query('SELECT * FROM users WHERE user_id = $1 or email=$1', [user_idOrEmail]);
    if (!(emailChek.rows.length > 0)) {
        return res.status(400).json({ error: 'User name or email dus not exist create account first' });
    }

    const user = emailChek.rows[0];

    // Compare hashed password
    const isMatch = bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // create token to stay logd in
    const token = jwt.sign({user}, "secretkey")

    // Send response
    return res.status(200).json({
        msg: 'login succesful',
        user_id: user.user_id,
        email: user.email,
        token,
      });

} catch (e) {
    console.error('Error during login', e);
    res.status(500).json({ error: 'Somthing whent wrong when loging in contact Antoine'});    
}
});


// get all user data
authRouter.get("/api/", auth, async (req, res) => {
    const user_idOrEmail = req.query.user_idOrEmail;
    if (!user_idOrEmail) {
        return res.status(400).json({ error: 'user_id or user name parameter is required' });
    }
    
    const result = await db.query('SELECT * FROM users WHERE user_id = $1 or email = $1', [user_idOrEmail]);
    const user = result.rows[0];
    const token = req.token;

    if (result.rows.length > 0) {
    res.status(200).json({msg: "token corect", 
        user_id: user.user_id, 
        email: user.email,
        token: req.token,
        });

    } else {
        res.status(404).send('User not found');
    }
});


module.exports = authRouter