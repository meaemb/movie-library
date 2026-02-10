const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const users = client.db('movie_library').collection('users');

  const email = 'beginaa@mail.ru';
  const password = '123456';
  const passwordHash = await bcrypt.hash(password, 10);

  await users.insertOne({
    email,
    passwordHash,
    role: 'user',
    createdAt: new Date()
  });

  console.log('User created:', email, password);
  await client.close();
}

main();
