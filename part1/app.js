const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 8080;

let db; // This will hold the database connection

// Connect to the database and insert test data
async function init() {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'DogWalkService'
    });

    // Insert sample users (if not already in the table)
    await db.query(`
      INSERT IGNORE INTO Users (username, email, password_hash, role)
      VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker');
    `);

    // Insert one test dog
    await db.query(`
      INSERT IGNORE INTO Dogs (owner_id, name, size)
      VALUES (
        (SELECT user_id FROM Users WHERE username = 'alice123'),
        'Max',
        'medium'
      );
    `);

    // Insert one test walk request
    await db.query(`
      INSERT IGNORE INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES (
        (SELECT dog_id FROM Dogs WHERE name = 'Max'),
        '2025-06-10 08:00:00',
        30,
        'Parklands',
        'open'
      );
    `);

    console.log('Connected to the database and inserted test data');
  } catch (err) {
    console.error('ERROR connecting to database:', err);
    process.exit(1);
  }
}

// Returns a list of all dogs with their size and owner's username
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dogs' });
  }
});

// Route: GET /api/walkrequests/open
// Returns all open walk requests with dog name, time, and owner's username
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        WalkRequests.request_id,
        Dogs.name AS dog_name,
        WalkRequests.requested_time,
        WalkRequests.duration_minutes,
        WalkRequests.location,
        Users.username AS owner_username
      FROM WalkRequests
      JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
      JOIN Users ON Dogs.owner_id = Users.user_id
      WHERE WalkRequests.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get open walk requests' });
  }
});

// Route: GET /api/walkers/summary
// Returns each walker's username, number of ratings, average rating, and completed walks
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 1) AS average_rating,
        COUNT(CASE WHEN wr.status = 'completed' THEN 1 END) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      LEFT JOIN WalkRequests wr ON r.request_id = wr.request_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get walker summary' });
  }
});

// Start the server after database setup
init().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});
