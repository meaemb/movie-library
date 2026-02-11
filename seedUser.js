const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'movie_library';

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const users = client.db(DB_NAME).collection('users');

  const email = 'beginaa@mail.ru';
  const password = '123456';

  const passwordHash = await bcrypt.hash(password, 10);

  await users.insertOne({
    email: email.toLowerCase(),
    passwordHash,
    role: 'user',
    createdAt: new Date()
  });

  console.log('User created:', email, password);
  await client.close();
}

main();
