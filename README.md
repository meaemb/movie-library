# Movie Library — Web Application

Movie Library is a Node.js & Express.js web application that serves as a prototype
for a movie catalog website.
The project is developed incrementally as part of university backend assignments.

- **Assignment 2** - Express basics and CRUD with SQLite
- **Assignment 3 Part 1** - Backend API with MongoDB (CRUD, filtering, sorting, projection)
- **Assignment 3 Part 2** — MongoDB Atlas, environment variables, deployment  


# Assignment 3 — Part 2: Backend API with MongoDB & Deployment

## Project Description

In Assignment 3 Part 2, the project was extended to become fully deployment-ready.
The backend application now uses **MongoDB Atlas** as a cloud database,
**environment variables** for configuration, and is **deployed online** using a hosting platform.

All CRUD operations are performed through the website interface, without using
Postman or Thunder Client.

The application demonstrates a complete backend workflow:
database connection, CRUD operations, environment configuration, and deployment.

## Team Members (Assignment 3 — Part 2)

- **Kamila A. (SE-2427)**  
  MongoDB Atlas setup, database connection.

- **Begina M. (SE-2427)**  
  Deployment to Render, environment variables configuration.

- **Dilyara A. (SE-2427)**  
  GitHub repository management.


## Technologies Used (Assignment 3 — Part 1)

- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **MongoDB Native Driver**
- **dotenv**
- **HTML5**
- **CSS3**


## Database Design

- Database: MongoDB
- Database name: movie_library
- Collection: movies

## Movie Document Structure
{
  "_id": ObjectId,
  "title": "String",
  "description": "String",
  "year": Number,
  "createdAt": Date
}
The database and collection are created automatically after the first
successful POST request.


## REST API Routes (CRUD)

| Method | Route              | Description                    |
|------|--------------------|--------------------------------|
| GET  | /api/movies        | Get all movies (sorted by ID)  |
| GET  | /api/movies/:id    | Get a movie by ID              |
| POST | /api/movies        | Create a new movie (JSON)      |
| PUT  | /api/movies/:id    | Update a movie by ID (JSON)    |
| DELETE | /api/movies/:id  | Delete a movie by ID           |

All API routes return JSON responses with proper HTTP status codes.

## Query Features

- Filtering: /api/movies?year=2014

- Sorting: /api/movies?sort=year

- Projection: /api/movies?fields=title,year

## Validation & Error Handling (Part 2)

- **200 OK** — successful GET, PUT, DELETE  
- **201 Created** — successful POST  
- **400 Bad Request** — invalid ID or missing fields  
- **404 Not Found** — movie not found  
- **500 Internal Server Error** — database or server error  


## Home Page API Test Links

The Home page includes direct links for quick API testing:
- `/api/movies`
- `/api/movies?sort=year`
- `/api/movies?fields=title,year`


## Project Structure
movie-library/
├── public/
│   └── styles.css
│   └── movies.js
├── views/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   └── 404.html
├── server.js
├── package.json
├── package-lock.json
└── README.md



## Installation & Run Instructions

1. Clone the repository:
git clone https://github.com/meaemb/movie-library.git

2. Navigate to the project folder:
cd movie-library

3. Install dependencies:
npm install

4. Run the server:
node server.js

5. Open in browser:
http://localhost:3000