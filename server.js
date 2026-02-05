/*
  ASSIGNMENT 4
  Sessions & Security on top of Assignment 3 Part 2
*/

const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();

/* =====================
   ENV CONFIG
===================== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'movie_library';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_change_me';

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
   SESSIONS (COOKIE-BASED SESSION ID)
===================== */
app.set('trust proxy', 1); // important for Render/HTTPS secure cookies

app.use(
  session({
    name: 'sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      dbName: DB_NAME,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7, // 7 days
    }),
    cookie: {
      httpOnly: true, // REQUIRED:contentReference[oaicite:9]{index=9}
      secure: process.env.NODE_ENV === 'production', // recommended in prod:contentReference[oaicite:10]{index=10}
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

/* =====================
   DB CONNECTION
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
   AUTH HELPERS
===================== */
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' }); // protects write ops:contentReference[oaicite:11]{index=11}
  }
  next();
}

/* =====================
   PAGE ROUTES
===================== */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

/* =====================
   CONTACT FORM
===================== */
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).send('All fields are required');

  const data = { name, email, message, createdAt: new Date().toISOString() };

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
   AUTH API (LOGIN/LOGOUT/ME)
   - Login via Web UI
   - Generic error messages only: "Invalid credentials":contentReference[oaicite:12]{index=12}
===================== */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Invalid credentials' });

    const user = await usersCollection.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Session created after successful login:contentReference[oaicite:13]{index=13}
    req.session.user = { id: String(user._id), email: user.email, role: user.role || 'user' };

    res.json({ message: 'Logged in' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

/* =====================
   MOVIES CRUD (GET public, WRITE protected)
===================== */

/* GET all movies (public) */
app.get('/api/movies', async (req, res) => {
  try {
    const { year, sort, fields } = req.query;

    const filter = {};
    if (year) filter.year = Number(year);

    const options = {};
    if (sort) options.sort = { [sort]: 1 };

    if (fields) {
      options.projection = {};
      fields.split(',').forEach(f => (options.projection[f.trim()] = 1));
    }

    const movies = await moviesCollection.find(filter, options).toArray();
    res.json(movies);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET movie by id (public) */
app.get('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* POST create movie (protected) */
app.post('/api/movies', requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      year,
      genre,
      director,
      durationMinutes,
      rating,
    } = req.body || {};

    // validation:contentReference[oaicite:14]{index=14}
    if (!title || !description || !genre || !director) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = {
      title: String(title).trim(),
      description: String(description).trim(),
      year: year ? Number(year) : null,
      genre: String(genre).trim(),
      director: String(director).trim(),
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      rating: rating ? Number(rating) : null,
      createdAt: new Date(),
    };

    const result = await moviesCollection.insertOne(doc);
    res.status(201).json({ id: result.insertedId });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});
/* PUT update movie (protected) */
app.put('/api/movies/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const {
      title,
      description,
      year,
      genre,
      director,
      durationMinutes,
      rating,
    } = req.body || {};

    if (!title || !description || !genre || !director) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const update = {
      title: String(title).trim(),
      description: String(description).trim(),
      year: year ? Number(year) : null,
      genre: String(genre).trim(),
      director: String(director).trim(),
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      rating: rating ? Number(rating) : null,
    };

    const result = await moviesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Movie not found' });
    res.json({ message: 'Movie updated' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* DELETE movie (protected) */
app.delete('/api/movies/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await moviesCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

/* =====================
   GLOBAL 404
===================== */
app.use((req, res) => {
  if (req.url.startsWith('/api')) res.status(404).json({ error: 'API route not found' });
  else res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

/* =====================
   START
===================== */
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connect failed:', err);
    process.exit(1);
  });
