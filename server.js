/*
  ASSIGNMENT 4
  Sessions, Authentication & Authorization
*/

const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');

require('dotenv').config();

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
    store: new MongoStore({
      mongoUrl: MONGO_URI,
      dbName: DB_NAME,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
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
   AUTH MIDDLEWARE
===================== */
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
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
   AUTH API
===================== */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = await usersCollection.findOne({
      email: String(email).toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    };

    res.json({ message: 'Logged in' });
  } catch (err) {
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
   MOVIES API
===================== */

// GET all movies (public)
app.get('/api/movies', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = {};

    if (year) filter.year = Number(year);

    const movies = await moviesCollection.find(filter).toArray();
    res.json(movies);
  } catch {
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

// CREATE movie (protected)
app.post('/api/movies', requireAuth, async (req, res) => {
  const { title, description, year } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const result = await moviesCollection.insertOne({
    title,
    description,
    year: year ? Number(year) : null,
    createdAt: new Date(),
  });

  res.status(201).json({ id: result.insertedId });
});

// UPDATE movie (protected)
app.put('/api/movies/:id', requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { title, description, year } = req.body;

  const result = await moviesCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { title, description, year: Number(year) } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  res.json({ message: 'Movie updated' });
});

// DELETE movie (protected)
app.delete('/api/movies/:id', requireAuth, async (req, res) => {
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
   START SERVER
===================== */
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });
