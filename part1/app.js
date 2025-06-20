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
      })
    }
}