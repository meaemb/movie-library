const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'movie_library';
const ADMIN_ID = "6984d7003d9fa07c56f3bd56";



const movies = [
  {
    title: "Inception",
    year: 2010,
    genre: "Sci-Fi",
    director: "Christopher Nolan",
    durationMinutes: 148,
    rating: 8.8,
    description: "A skilled thief enters dreams to steal secrets but is offered a chance to erase his criminal past."
  },
  {
    title: "Interstellar",
    year: 2014,
    genre: "Sci-Fi",
    director: "Christopher Nolan",
    durationMinutes: 169,
    rating: 8.7,
    description: "A team of astronauts travels through a wormhole in search of a new home for humanity."
  },
  {
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    director: "Christopher Nolan",
    durationMinutes: 152,
    rating: 9.0,
    description: "Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos."
  },
  {
    title: "Parasite",
    year: 2019,
    genre: "Thriller",
    director: "Bong Joon-ho",
    durationMinutes: 132,
    rating: 8.5,
    description: "A poor family schemes to infiltrate a wealthy household with unexpected consequences."
  },
  {
    title: "Whiplash",
    year: 2014,
    genre: "Drama",
    director: "Damien Chazelle",
    durationMinutes: 106,
    rating: 8.5,
    description: "A young drummer pushes himself to the limit under a ruthless jazz instructor."
  },
  {
    title: "Fight Club",
    year: 1999,
    genre: "Drama",
    director: "David Fincher",
    durationMinutes: 139,
    rating: 8.8,
    description: "An insomniac office worker forms an underground fight club with a mysterious soap salesman."
  },
  {
    title: "Forrest Gump",
    year: 1994,
    genre: "Drama",
    director: "Robert Zemeckis",
    durationMinutes: 142,
    rating: 8.8,
    description: "The life story of a simple man whose kindness and perseverance shape history."
  },
  {
    title: "The Matrix",
    year: 1999,
    genre: "Sci-Fi",
    director: "The Wachowskis",
    durationMinutes: 136,
    rating: 8.7,
    description: "A hacker discovers the reality he lives in is a simulated world controlled by machines."
  },
  {
    title: "Gladiator",
    year: 2000,
    genre: "Action",
    director: "Ridley Scott",
    durationMinutes: 155,
    rating: 8.5,
    description: "A betrayed Roman general seeks revenge against the corrupt emperor."
  },
  {
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    director: "Frank Darabont",
    durationMinutes: 142,
    rating: 9.3,
    description: "Two imprisoned men bond over years, finding hope and redemption."
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    genre: "Crime",
    director: "Quentin Tarantino",
    durationMinutes: 154,
    rating: 8.9,
    description: "Interconnected stories of crime and redemption in Los Angeles."
  },
  {
    title: "The Godfather",
    year: 1972,
    genre: "Crime",
    director: "Francis Ford Coppola",
    durationMinutes: 175,
    rating: 9.2,
    description: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son."
  },
  {
    title: "The Social Network",
    year: 2010,
    genre: "Drama",
    director: "David Fincher",
    durationMinutes: 120,
    rating: 7.7,
    description: "The story of the creation of Facebook and the lawsuits that followed."
  },
  {
    title: "La La Land",
    year: 2016,
    genre: "Romance",
    director: "Damien Chazelle",
    durationMinutes: 128,
    rating: 8.0,
    description: "A jazz musician and an aspiring actress fall in love while pursuing their dreams."
  },
  {
    title: "The Silence of the Lambs",
    year: 1991,
    genre: "Thriller",
    director: "Jonathan Demme",
    durationMinutes: 118,
    rating: 8.6,
    description: "An FBI trainee seeks help from a cannibalistic serial killer to catch another murderer."
  },
  {
    title: "Joker",
    year: 2019,
    genre: "Drama",
    director: "Todd Phillips",
    durationMinutes: 122,
    rating: 8.4,
    description: "A failed comedian descends into madness and becomes a symbol of chaos."
  },
  {
    title: "Avengers: Endgame",
    year: 2019,
    genre: "Action",
    director: "Anthony and Joe Russo",
    durationMinutes: 181,
    rating: 8.4,
    description: "The Avengers assemble one final time to reverse the devastation caused by Thanos."
  },
  {
    title: "Titanic",
    year: 1997,
    genre: "Romance",
    director: "James Cameron",
    durationMinutes: 195,
    rating: 7.9,
    description: "A romance blossoms aboard the ill-fated RMS Titanic."
  },
  {
    title: "The Wolf of Wall Street",
    year: 2013,
    genre: "Biography",
    director: "Martin Scorsese",
    durationMinutes: 180,
    rating: 8.2,
    description: "The rise and fall of a stockbroker living a life of excess."
  },
  {
    title: "Blade Runner 2049",
    year: 2017,
    genre: "Sci-Fi",
    director: "Denis Villeneuve",
    durationMinutes: 164,
    rating: 8.0,
    description: "A young blade runner uncovers a secret that could plunge society into chaos."
  }
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const col = db.collection('movies');

  const docs = movies.map(movie => ({
  ...movie,
  ownerId: ADMIN_ID,
  createdAt: new Date()
}));

  const result = await col.insertMany(docs);
  console.log(`Inserted ${result.insertedCount} movies`);

  await client.close();
}

main().catch(console.error);