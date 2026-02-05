const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'movie_library';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection('users');

  const email = 'admin@movielibrary.com';
  const password = 'Admin12345!';
  const passwordHash = await bcrypt.hash(password, 10);

  const exists = await users.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
  } else {
    await users.insertOne({ email, passwordHash, role: 'admin', createdAt: new Date() });
    console.log('Admin created:', email, 'password:', password);
  }

  await client.close();
}

main().catch(console.error);
