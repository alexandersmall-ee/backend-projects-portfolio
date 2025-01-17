// Music Playlist Manager API

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();

// Create the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./db/database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database on disk.');
    }
});

// Create database schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        genre TEXT,
        playlist_id INTEGER NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id)
    )`);
});

// Routes

// Welcome route
app.get('/', (req, res) => {
    res.send('Welcome to the Music Playlist Manager API!');
});

// User Registration
app.post('/users/register', (req, res) => {
    const { username, password } = req.body;
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;

    db.run(query, [username, password], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Username already exists.' });
        }
        res.status(201).json({ id: this.lastID, username });
    });
});

// Playlist Creation
app.post('/playlists', (req, res) => {
    const { name, user_id } = req.body;
    const query = `INSERT INTO playlists (name, user_id) VALUES (?, ?)`;

    db.run(query, [name, user_id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// Add Song to Playlist
app.post('/songs', (req, res) => {
    const { title, artist, genre, playlist_id } = req.body;
    const query = `INSERT INTO songs (title, artist, genre, playlist_id) VALUES (?, ?, ?, ?)`;

    db.run(query, [title, artist, genre, playlist_id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, artist, genre });
    });
});

// Fetch All Songs from a Playlist
app.get('/playlists/:id/songs', (req, res) => {
    const playlist_id = req.params.id;
    const query = `SELECT * FROM songs WHERE playlist_id = ?`;

    db.all(query, [playlist_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
