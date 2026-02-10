/*
  ASSIGNMENT 4
  Sessions, Authentication & Authorization
*/

const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const session = require('express-session');
require('dotenv').config();

const { requireAuth, requireOwnerOrAdmin } = require('./middleware/auth'); // from folder
const { createAuthRoutes } = require('./routes/authRoutes'); // from folder

const app = express();

/* =====================
   ENV CONFIG
===================== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'movie_library';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_change_me';

/* =====================
   BASIC MIDDLEWARE
===================== */
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* =====================
   SESSION CONFIG
===================== */
app.set('trust proxy', 1);

app.use(
  session({
    name: 'sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* =====================
   DATABASE
===================== */
let client;
let moviesCollection;
let usersCollection;

async function connectDB() {
  client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  moviesCollection = db.collection('movies');
  usersCollection = db.collection('users');

  console.log('MongoDB connected');
}

/* =====================
   PAGE ROUTES
===================== */
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
);

app.get('/about', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'about.html'))
);

app.get('/contact', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'contact.html'))
);

app.get('/login', (req, res) =>
  res.sendFile(path.join(__dirname, 'views', 'login.html'))
);

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
    createdAt: new Date().toISOString(),
  };

  fs.writeFile('contact-data.json', JSON.stringify(data, null, 2), err => {
    if (err) return res.status(500).send('Failed to save data');

    res.send(`
      <h2>Thanks, ${name}!</h2>
      <p>Your message has been saved successfully.</p>
      <a href="/contact">Go back</a>
    `);
  });
});

/* =====================
   MOVIES API
===================== */

// GET all movies (public) + pagination + filters
app.get('/api/movies', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);

    const { year, search } = req.query;
    const filter = {};

    if (year) {
      const y = Number(year);
      if (Number.isNaN(y)) return res.status(400).json({ error: 'Invalid year' });
      filter.year = y;
    }

    if (search) {
      filter.title = { $regex: String(search), $options: 'i' };
    }

    const total = await moviesCollection.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const items = await moviesCollection
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ page, limit, total, totalPages, items });
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET movie by id (public)
app.get('/api/movies/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const movie = await moviesCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!movie) return res.status(404).json({ error: 'Movie not found' });

  res.json(movie);
});

// CREATE movie (protected) + domain fields + validation
app.post('/api/movies', requireAuth, async (req, res) => {
  const { title, description, year, genre, director, durationMinutes, rating } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing title/description' });
  }

  const y = year ? Number(year) : null;
  if (year && Number.isNaN(y)) return res.status(400).json({ error: 'Invalid year' });

  const dur = durationMinutes ? Number(durationMinutes) : null;
  if (durationMinutes && (Number.isNaN(dur) || dur <= 0)) {
    return res.status(400).json({ error: 'Invalid durationMinutes' });
  }

  const r = rating ? Number(rating) : null;
  if (rating && (Number.isNaN(r) || r < 0 || r > 10)) {
    return res.status(400).json({ error: 'Invalid rating (0-10)' });
  }

  const result = await moviesCollection.insertOne({
    title: String(title).trim(),
    description: String(description).trim(),
    year: y,
    genre: genre ? String(genre).trim() : null,
    director: director ? String(director).trim() : null,
    durationMinutes: dur,
    rating: r,
    ownerId: req.session.user.id,
    createdAt: new Date(),
  });

  res.status(201).json({ id: result.insertedId });
});

// UPDATE movie (protected + owner/admin) + domain fields + validation
app.put(
  '/api/movies/:id',
  requireAuth,
  requireOwnerOrAdmin(async (req) => {
    if (!ObjectId.isValid(req.params.id)) return null;

    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    return movie?.ownerId;
  }),
  async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const { title, description, year, genre, director, durationMinutes, rating } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing title/description' });
    }

    const y = year ? Number(year) : null;
    if (year && Number.isNaN(y)) return res.status(400).json({ error: 'Invalid year' });

    const dur = durationMinutes ? Number(durationMinutes) : null;
    if (durationMinutes && (Number.isNaN(dur) || dur <= 0)) {
      return res.status(400).json({ error: 'Invalid durationMinutes' });
    }

    const r = rating ? Number(rating) : null;
    if (rating && (Number.isNaN(r) || r < 0 || r > 10)) {
      return res.status(400).json({ error: 'Invalid rating (0-10)' });
    }

    const result = await moviesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title: String(title).trim(),
          description: String(description).trim(),
          year: y,
          genre: genre ? String(genre).trim() : null,
          director: director ? String(director).trim() : null,
          durationMinutes: dur,
          rating: r,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie updated' });
  }
);

// DELETE movie (protected + owner/admin)
app.delete(
  '/api/movies/:id',
  requireAuth,
  requireOwnerOrAdmin(async (req) => {
    if (!ObjectId.isValid(req.params.id)) return null;

    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    return movie?.ownerId;
  }),
  async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const result = await moviesCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted' });
  }
);

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
   START SERVER
===================== */
connectDB()
  .then(() => {
    // connect auth routes after DB is ready
    app.use('/api/auth', createAuthRoutes(usersCollection));

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });
