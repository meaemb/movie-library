# Movie Library — Web Application

Movie Library is a Node.js & Express.js web application that serves as a prototype
for a movie catalog website.
The project is developed incrementally as part of university backend assignments.

- **Assignment 2** - Express basics and CRUD with SQLite
- **Assignment 3 Part 1** - Backend API with MongoDB (CRUD, filtering, sorting, projection)
- **Assignment 3 Part 2** — MongoDB Atlas, environment variables, deployment  
- **Assignment 4** — Sessions-based authentication, users, middleware protection, UI integration

# Assignment 4 — Sessions-Based Authentication & UI Protection

## Project Description

In Assignment 4, the project was extended with sessions-based authentication and user management.

The application now supports:

- User authentication with bcrypt

- Server-side sessions using express-session

- Protected API routes using middleware

- Dynamic UI behavior based on authentication state

- All authentication and CRUD operations are performed via the Web UI.

## Team Members (Assignment 4)

- **Kamila A. (SE-2427)** - Domain Data & UI Forms
  - Extended movie domain model (5–8 fields)
  - Updated Add/Edit movie forms
  - Seeded MongoDB with 20+ realistic movie documents

- **Begina M. (SE-2427)** - Users & Sessions
  - Users collection with admin user
  - Password hashing using bcrypt
  - Login endpoint
  - Server-side sessions with express-session

- **Dilyara A. (SE-2427)** - Middleware & UI Authentication
  - requireAuth middleware
  - Protected POST / PUT / DELETE routes
  - Login / Logout UI
  - Conditional rendering of Add/Edit/Delete actions


## Technologies Used (Assignment 3 — Part 1)

- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **MongoDB Native Driver**
- **dotenv**
- **express-session**
- **bcrypt**
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**

## Authentication (Assignment 4)
### Sessions-Based Authentication

- Login via Web UI (/login)
- After successful login:
    - Server creates a session
    - Session ID is stored in a browser cookie
    - Session persists between requests
- Authenticated user is accessible via req.session.user

### Middleware Protection

- requireAuth middleware protects:
    - POST /api/movies
    - PUT /api/movies/:id
    - DELETE /api/movies/:id

Unauthenticated users cannot modify data.

## UI Authentication Behavior
- Login / Logout displayed dynamically
- Authenticated users can:
    - Add movies
    - Edit movies
    - Delete movies
- Unauthenticated users:
    - Can only view movies
    - CRUD actions are hidden

Authentication state is checked via /api/auth/me.

## Database Design

- Database: MongoDB
- Database name: movie_library
- Collection: movies

## Movie Document Structure
{
  "_id": ObjectId,
  "title": "String",
  "year": Number,
  "genre": "String",
  "director": "String",
  "durationMinutes": Number,
  "rating": Number,
  "description": "String",
  "createdAt": Date
}
The database is populated using a seed script with 20+ realistic movie documents.

## User Document Structure
{
  "_id": ObjectId,
  "email": "String",
  "passwordHash": "String",
  "role": "admin",
  "createdAt": Date
}
Passwords are securely stored using bcrypt hashing.


## REST API Routes (CRUD)

### Authentication routes
| Method | Route            | Description               |
|------|--------------------|---------------------------|
| POST | /api/auth/login    | User login                |
| GET  | /api/auth/lgout    | User logout               |
| GET  | /api/auth/me       | Get current user session  |



| Method | Route              | Description                  |
|------|--------------------|--------------------------------|
| GET  | /api/movies        | Get all movies                 |
| POST | /api/movies        | Create a new movie (auth)      |
| PUT  | /api/movies/:id    | Update a movie by ID (auth)    |
| DELETE | /api/movies/:id  | Delete a movie by ID           |


## Environment Variables

The application uses environment variables for configuration:

PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/movie_library
SESSION_SECRET=your_secret_key

## Validation & Error Handling (Part 2)

- **200 OK** — successful GET, PUT, DELETE  
- **201 Created** — successful POST  
- **400 Bad Request** — invalid ID or missing fields  
- **404 Not Found** — movie not found  
- **500 Internal Server Error** — database or server error  



## Project Structure
movie-library/
├── public/
│   ├── styles.css
│   ├── movies.js
│   └── login.js
├── views/
│   ├── index.html
│   ├── login.html
│   ├── about.html
│   ├── contact.html
│   └── 404.html
├── seedMovies.js
├── seedAdmin.js
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