const express = require('express');
const mysql = require('mysql2/promise');
const app = express()
const port = 8080;

let db;

// connecting to mysql and inserting the test data
async function init() {
    db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
    })
}