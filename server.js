const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log(process.env.PORT)

const app = express();
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`it's alive on http://localhost:${port}`);
});

// Configure PostgreSQL client
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
  
// Middleware to parse JSON bodies
app.use(express.json());