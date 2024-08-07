const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const authRouts = require("./routs/auth");
const postsRout = require("./routs/posts");
const friendRout = require("./routs/frend")
const db = require('./db_conection');


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

const localIP = '192.168.1.51';
app.listen(port, localIP, () => {
    console.log(`it's alive on http://helo`); //${localIP}:${port}
});

app.use(authRouts);
app.use(postsRout);
app.use(friendRout);

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