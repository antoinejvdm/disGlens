const express = require("express");
const db = require("../db_conection");
const postsRout = express.Router();

// API endpoint get all posts
postsRout.get('/api/feed', async (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ message: 'user_id is required' });
      }
    try {
      
      const query = `SELECT p.*
        FROM post p
        JOIN(
        SELECT friend2 AS user_id FROM friends WHERE friend1 = $1
        UNION
        SELECT friend1 AS user_id FROM friends WHERE friend2 = $1
        UNION
        SELECT $1 AS user_id
          ) AS user_ids ON p.user_id = user_ids.user_id
        ORDER BY p.time DESC;`;
      // Query execution
      const { rows } = await db.query(query, [user_id]);
  
      // Send response with all posests
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'internal error when geting post' });
    }
  });

  // API endpoint to create a new post indcoded in base64
postsRout.post('/api/post', async (req, res) => {
    const { user_id, img, comment} = req.body;
  
    // Basic validation
    if (!user_id || !img) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      // Query to insert a new post into the database
      const query = `
        INSERT INTO post (user_id, img, comment, time)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const values = [user_id, img, comment];
  
      // Query execution
      const { rows } = await db.query(query, values);
  
      // Send response with the newly created post
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error wile posting a post' });
   }
  
  }
  );

  
module.exports = postsRout;