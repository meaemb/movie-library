/*
  FINAL PROJECT
*/

const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcrypt');
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
   TEMP USER CREATION (DELETE AFTER USE)
===================== */
app.get('/create-test-user', async (req, res) => {
  try {
    const hash = await bcrypt.hash('123456', 10);

    await usersCollection.insertOne({
      email: 'beginaa@mail.ru',
      passwordHash: hash,
      role: 'user',
      createdAt: new Date(),
    });

    res.send('User created: beginaa@mail.ru / 123456');
  } catch (err) {
    res.status(500).send('Error creating user');
  }
});

/* =====================
   MOVIES API
===================== */

app.get('/api/movies', async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = 12;

  const total = await moviesCollection.countDocuments();
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const items = await moviesCollection
    .find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ page, totalPages, items });
});

app.post('/api/movies', requireAuth, async (req, res) => {
  await moviesCollection.insertOne({
    ...req.body,
    ownerId: req.session.user.id,
    createdAt: new Date(),
  });

  res.status(201).json({ message: 'Movie created' });
});

app.put(
  '/api/movies/:id',
  requireAuth,
  requireOwnerOrAdmin(async req => {
    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    return movie?.ownerId;
  }),
  async (req, res) => {
    await moviesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ message: 'Movie updated' });
  }
);

app.delete(
  '/api/movies/:id',
  requireAuth,
  requireOwnerOrAdmin(async req => {
    const movie = await moviesCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    return movie?.ownerId;
  }),
  async (req, res) => {
    await moviesCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({ message: 'Movie deleted' });
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
