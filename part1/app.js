const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 8080;

let db;

