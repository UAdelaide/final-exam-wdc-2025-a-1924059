const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 8080;

let db;

// connect to mysql and insert the test data
async function init() {
    try {
      db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'DogWalkService'
      });

      await db.query(`
        INSERT IGNORE INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker');
        `);

      await d
    }
}