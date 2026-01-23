/*
   ASSIGNMENT 3 — PART 2
   Backend API with MongoDB (CRUD + ENV + Deployment Ready)
*/

const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

/* =====================
   ENV CONFIG
===================== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'movie_library';

/* =====================
   MIDDLEWARE
===================== */
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* =====================
   PAGE ROUTES
===================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

/* =====================
   CONTACT FORM
===================== */
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

  fs.writeFile('contact-data.json', JSON.stringify(data, null, 2), err => {
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

/* =====================
   MONGODB CONNECTION
===================== */
let moviesCollection;

MongoClient.connect(MONGO_URI)
  .then(client => {
    const db = client.db(DB_NAME);
    moviesCollection = db.collection('movies');
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

/* =====================
   CRUD API ROUTES
===================== */

/* GET all movies
   /api/movies?year=2023&sort=year&fields=title,year
*/
app.get('/api/movies', async (req, res) => {
  try {
    const { year, sort, fields } = req.query;

    const filter = {};
    if (year) filter.year = Number(year);

    const options = {};
    if (sort) options.sort = { [sort]: 1 };

    if (fields) {
      options.projection = {};
      fields.split(',').forEach(f => {
        options.projection[f] = 1;
      });
    }

    const movies = await moviesCollection.find(filter, options).toArray();
    res.json(movies);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET movie by id */
app.get('/api/movies/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const movie = await moviesCollection.findOne({ _id: new ObjectId(id) });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* POST create movie */
app.post('/api/movies', async (req, res) => {
  const { title, description, year } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await moviesCollection.insertOne({
      title,
      description,
      year: year ? Number(year) : null,
      createdAt: new Date()
    });

    res.status(201).json({ id: result.insertedId });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* PUT update movie */
app.put('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, year } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await moviesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, year: Number(year) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie updated' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* DELETE movie */
app.delete('/api/movies/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const result = await moviesCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* =====================
   GLOBAL 404
===================== */
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  }
});

/* =====================
   SERVER
===================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
