const express = require("express");
const friendRout = express.Router();
const db = require("../db_conection");

//add friend in friends tabal, giv the user hou is seurtching and the friend he is seurching
friendRout.post("/api/sendRequestFriend", async (req, res) => {
    try {
        const {user_id, seutchFriend} =  req.body;
        if (!user_id || !seutchFriend) {
            return res.status(400).json({ error: 'Missing user_id or seutched friend' });
          }
      
          // Check if both users exist
          const userCheckQuery = `
            SELECT user_id FROM users WHERE user_id = $1 OR user_id = $2 OR email = $2 
            ORDER BY
              CASE
                WHEN user_id = $1 THEN 1
                WHEN user_id = $2 THEN 2
                WHEN email = $2 THEN 3
              END;
          `;
          const userCheckResult = await db.query(userCheckQuery, [user_id, seutchFriend]);
      
          if (userCheckResult.rows.length !== 2) {
            return res.status(404).json({ error: 'One or both users not found or more than 2 users found' });
          }
          
          // Insert into friends table
          const insertFriendQuery = `
            INSERT INTO friends (friend1, friend2)
            VALUES ($1, $2)
          `;

          await db.query(insertFriendQuery, [user_id, userCheckResult.rows[1].user_id]);
      
          res.status(200).json({ message: 'Friend request sended' });
        } catch (e) {
          console.error('Error during adding friend', e);
          res.status(500).json({ error: 'Something went wrong when adding friend contact Antoine' });
        }
      });

// // friend recomandeation when typing
// friendRout.get('/api/findFriend', async (req, res) => {
//     try {
//       const { user_idOrEmail } = req.query;
        

//       if (!user_idOrEmail) {
//         return res.status(400).json({ error: 'Missing required user_id or email' });
//       }
  
//       const query = `SELECT user_id FROM users WHERE user_id LIKE $1 OR email LIKE $1`;
 
//       const result = await db.query(query, [`${user_idOrEmail}%`]);
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'No users found' });
//       }
  
//       res.status(200).json(result.rows);
//     } catch (e) {
//       console.error('Error during finding friend', e);
//       res.status(500).json({ error: 'Something went wrong when finding friend' });
//     }
//   });

// Find Friend Route (GET) when cliken seurtdhe
friendRout.get('/api/seurtchFriend', async (req, res) => {
  try {
    const { user_idOrEmail, current_user_id } = req.query;

    if (!user_idOrEmail || !current_user_id) {
      return res.status(400).json({ error: 'Missing required user_idOrEmail or current_user_id' });
    }

    const query = `
  SELECT 
    u.user_id,
    u.email,
    CASE
        WHEN f.friend1 IS NOT NULL AND f.friend2 IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS is_friend,
    CASE
        WHEN f.accepted IS TRUE THEN TRUE
        ELSE FALSE
    END AS is_accepted,
    CASE
        WHEN f.friend1 = $2 THEN TRUE
        ELSE FALSE
    END AS send_request
  FROM users u
  LEFT JOIN friends f
      ON (f.friend1 = u.user_id AND f.friend2 = $2)
      OR (f.friend1 = $2 AND f.friend2 = u.user_id)
  WHERE (u.user_id LIKE $1 OR u.email LIKE $1)
    AND u.user_id != $2;
    `;

    const result = await db.query(query, [`${user_idOrEmail}%`, current_user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.status(200).json(result.rows);
  } catch (e) {
    console.error('Error during finding friend', e);
    res.status(500).json({ error: 'Something went wrong when finding friend' });
  }
});

// get all freinds of one user
friendRout.get('/api/getFriends', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing required user_id' });
    }

    const query = `
      SELECT 
    u.user_id,
    u.email,
    f.accepted,
    CASE
        WHEN f.friend1 = $1 THEN TRUE
        ELSE FALSE
    END AS send_request
FROM users u
JOIN friends f 
    ON u.user_id = f.friend2 
    OR u.user_id = f.friend1
WHERE 
    (f.friend1 = $1 OR f.friend2 = $1) 
    AND u.user_id != $1;
    `;

    const result = await db.query(query, [user_id]);

    if (result.rows.length === 0) {
      // console.log('No friends found');
      return res.status(404).json({ error: 'No friends found' });
    }
    res.status(200).json(result.rows);
  } catch (e) {
    console.error('Error during retrieving friends', e);
    res.status(500).json({ error: 'Something went wrong when retrieving friends' });
  }
});

// remove a friend
friendRout.get('/api/removeFriend', async (req, res) => {
  try {
    const { user_id, friend_user_id} = req.query;
      

    if (!user_id || !friend_user_id ) {
      return res.status(400).json({ error: 'Missing user_id or friend user_id' });
    }

    const query = 'DELETE FROM friends WHERE (friend1 = $1 AND friend2 = $2) OR (friend1 = $2 AND friend2 = $1)';

    const result = await db.query(query, [user_id,friend_user_id]);

    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Friendship removed successfully' });
    } else {
      res.status(404).json({ error: 'Friendship not found' });
    }

  } catch (e) {
    console.error('Error during finding friend for ${user_id}', e);
    res.status(500).json({ error: 'Something went wrong when finding friend' });
  }
});

friendRout.post('/api/acceptFriend', async (req, res) => {
  const { toAceptUser_id, user_id } = req.body;

  // Basic validation
  if (!toAceptUser_id || !user_id) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
      // Query to update the `accepted` column to true for the specified friendship
      const query = `
          UPDATE friends
          SET accepted = true
          WHERE (friend1 = $1 AND friend2 = $2)
             OR (friend1 = $2 AND friend2 = $1)
      `;

      // Execute the query with the provided user IDs
      const result = await db.query(query, [toAceptUser_id, user_id]);

      // Check if any rows were updated
      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Friendship not found (no friend demand)' });
      }

      // Send response indicating success
      res.status(200).json({ message: 'Friendship accepted' });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error while accepting friend' });
  }
});


      
module.exports = friendRout