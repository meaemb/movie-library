/*
  FINAL PROJECT - Production Version
*/

const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
require('dotenv').config();

const { requireAuth, requireOwnerOrAdmin } = require('./middleware/auth');
const { createAuthRoutes } = require('./routes/authRoutes');

const app = express();

/* =====================
   ENV CONFIG
===================== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'movie_library';
const SESSION_SECRET = process.env.SESSION_SECRET;

/* =====================
   BASIC MIDDLEWARE
===================== */
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* =====================
   DATABASE
===================== */
let moviesCollection;
let usersCollection;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  moviesCollection = db.collection('movies');
  usersCollection = db.collection('users');

  console.log('MongoDB connected');
}

/* =====================
   PAGE ROUTES
===================== */
app.get('/', (_, res) =>
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
);

app.get('/about', (_, res) =>
  res.sendFile(path.join(__dirname, 'views', 'about.html'))
);

app.get('/contact', (_, res) =>
  res.sendFile(path.join(__dirname, 'views', 'contact.html'))
);

app.get('/login', (_, res) =>
  res.sendFile(path.join(__dirname, 'views', 'login.html'))
);

/* =====================
   MOVIES API
===================== */

/* ---------- GET movies (pagination + filtering) ---------- */
app.get('/api/movies', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);

    const { year, search } = req.query;
    const filter = {};

    if (year) {
      const y = Number(year);
      if (Number.isNaN(y)) {
        return res.status(400).json({ error: 'Invalid year' });
      }
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

  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/* ---------- CREATE movie ---------- */
app.post('/api/movies', requireAuth, async (req, res) => {
  try {
    const { title, description, year, genre, director, durationMinutes, rating } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }

    const y = year ? Number(year) : null;
    if (year && Number.isNaN(y)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const dur = durationMinutes ? Number(durationMinutes) : null;
    if (durationMinutes && (Number.isNaN(dur) || dur <= 0)) {
      return res.status(400).json({ error: 'Invalid durationMinutes' });
    }

    const r = rating ? Number(rating) : null;
    if (rating && (Number.isNaN(r) || r < 0 || r > 10)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 10' });
    }

    await moviesCollection.insertOne({
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

    res.status(201).json({ message: 'Movie created' });

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------- UPDATE movie ---------- */
app.put(
  '/api/movies/:id',
  requireAuth,
  requireOwnerOrAdmin(async req => {
    if (!ObjectId.isValid(req.params.id)) return null;
    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    return movie?.ownerId;
  }),
  async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const { title, description, year, genre, director, durationMinutes, rating } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description required' });
      }

      await moviesCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            title,
            description,
            year: year ? Number(year) : null,
            genre,
            director,
            durationMinutes: durationMinutes ? Number(durationMinutes) : null,
            rating: rating ? Number(rating) : null,
          },
        }
      );

      res.json({ message: 'Movie updated' });

    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* ---------- DELETE movie ---------- */
app.delete(
  '/api/movies/:id',
  requireAuth,
  requireOwnerOrAdmin(async req => {
    if (!ObjectId.isValid(req.params.id)) return null;
    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    return movie?.ownerId;
  }),
  async (req, res) => {
    try {
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

    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

/* =====================
   START SERVER
===================== */
connectDB()
  .then(() => {
    app.use('/api/auth', createAuthRoutes(usersCollection));

    app.use((req, res) => {
      if (req.url.startsWith('/api')) {
        res.status(404).json({ error: 'API route not found' });
      } else {
        res.status(404).sendFile(
          path.join(__dirname, 'views', '404.html')
        );
      }
    });

    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
