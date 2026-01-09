const Database = require('better-sqlite3');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const db = new Database('movies.db');

/* =======================
   DATABASE INITIALIZATION
======================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    year INTEGER
  )
`).run();

/* =======================
   MIDDLEWARE
======================= */
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* =======================
   PAGE ROUTES
======================= */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  const data = {
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  fs.writeFile('contact-data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return res.status(500).send('Failed to save data');
    }

    res.send(`
      <h2>Thanks, ${name}!</h2>
      <p>Your message has been saved successfully.</p>
      <a href="/contact">Go back</a>
    `);
  });
});

/* =======================
   PART 1 ROUTES (KEEPED)
======================= */
app.get('/search', (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).send('Missing search query');
  }

  res.send(`<h2>Search results for: ${query}</h2>`);
});

app.get('/item/:id', (req, res) => {
  res.send(`<h2>Item page for ID: ${req.params.id}</h2>`);
});

app.get('/api/info', (req, res) => {
  res.json({
    project: 'Movie Library',
    assignment: 'Assignment 2 - Part 2',
    role: 'CRUD API with Database'
  });
});

/* =======================
   CRUD API ROUTES
======================= */

// GET all movies
app.get('/api/movies', (req, res) => {
  try {
    const movies = db.prepare('SELECT * FROM movies ORDER BY id ASC').all();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET movie by id
app.get('/api/movies/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create movie
app.post('/api/movies', (req, res) => {
  const { title, description, year } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = db
      .prepare('INSERT INTO movies (title, description, year) VALUES (?, ?, ?)')
      .run(title, description, year);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT update movie
app.put('/api/movies/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, description, year } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = db
      .prepare('UPDATE movies SET title=?, description=?, year=? WHERE id=?')
      .run(title, description, year, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie updated' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE movie
app.delete('/api/movies/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = db.prepare('DELETE FROM movies WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  }
});

/* =======================
   SERVER
======================= */
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
