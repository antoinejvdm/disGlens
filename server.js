const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const authRouts = require("./routs/auth");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the 'public' directory   
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies of incoming requests
app.use(express.json({ limit: '50mb'}));

// Define a route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(port, () => {
    console.log(`it's alive on http://localhost:${port}`);
});

app.use(authRouts);

// // API endpoint get all users
// app.get('/api/users', async (req, res) => {
//   try {
//     // Query
//     const query = 'SELECT * FROM users';

//     // Query execution
//     const { rows } = await pool.query(query);

//     // Send response with all users
//     res.json(rows);
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error wile geting users' });
//   }
// });

// // API endpoint get all posts
// app.get('/api/allpost', async (req, res) => {
//   try {
//     // Query
//     const query = 'SELECT * FROM post';

//     // Query execution
//     const { rows } = await pool.query(query);

//     // Send response with all posests
//     res.json(rows);
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'internal error when geting post' });
//   }
// });

// // API endpoint to create a new post indcoded in base64
// app.post('/api/post', async (req, res) => {
//   const { user_id, img, comment} = req.body;

//   // Basic validation
//   if (!user_id || !img) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   try {
//     // Query to insert a new post into the database
//     const query = `
//       INSERT INTO post (user_id, img, comment, time)
//       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
//       RETURNING *;
//     `;
//     const values = [user_id, img, comment];

//     // Query execution
//     const { rows } = await pool.query(query, values);

//     // Send response with the newly created post
//     res.status(201).json(rows[0]);
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error wile posting a post' });
//  }

// }
// );