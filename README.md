# Movie Library — Web Application

Movie Library is a Node.js & Express.js web application that serves as a prototype
for a movie catalog website.  
The project is developed in two stages as part of **Assignment 2**.

- **Part 1** focuses on routing, middleware, validation, and basic API setup  
- **Part 2** extends the project with database integration and full CRUD API


# Assignment 2 — Part 1: Express Basics

## Project Description (Part 1)

In Assignment 2 Part 1, the goal was to build a basic Express.js application with
server-side routing, middleware usage, form handling, validation, and a simple
JSON API endpoint.


## Team Members (Part 1)

- **Begina M. (SE-2427)**  
  Express server setup, project structure, main GET routes (`/`, `/about`),
  request logging middleware.

- **Dilyara A. (SE-2427)**  
  Contact page implementation, HTML form handling, POST `/contact` route,
  query parameters and dynamic routes.

- **Kamila A. (SE-2427)**  
  Server-side validation, saving form data to a JSON file, custom 404 error page,
  error-handling middleware.


## Features Implemented (Part 1)

- Express server running on port 3000
- Static file serving using Express
- Custom request logging middleware
- Form data parsing using `express.urlencoded`
- Server-side form validation
- Query parameters and dynamic routing
- JSON API endpoint
- Custom 404 error page


## Application Routes (Part 1)

- `/` — Home page  
- `/about` — About page  
- `/contact` — Contact page (GET + POST with validation)  
- `/search?q=value` — Search using query parameters  
- `/item/:id` — Dynamic route with URL parameter  
- `/api/info` — JSON API endpoint  
- Any other route — Custom 404 error page  


# Assignment 2 — Part 2: Database Integration & CRUD API

## Project Description (Part 2)

In Assignment 2 Part 2, the project was extended by integrating a database and
implementing a RESTful CRUD API.  
Real data storage is used instead of placeholders.

## Team Members (Assignment 2 — Part 2)

- **Kamila A. (SE-2427)**
SQLite database integration, table creation, server middleware setup.

- **Begina M. (SE-2427)**
RESTful CRUD API implementation, SQL queries, JSON responses.

- **Dilyara A. (SE-2427)**
Validation and HTTP status codes, 404 handling, Home page API links

## Technologies Used (Part 2)

- **Node.js**
- **Express.js**
- **SQLite**
- **better-sqlite3**
- **HTML5**
- **CSS3**


## Database Design

**Database:** SQLite  
**Table:** `movies`

### Table Structure

| Field        | Type     | Description                  |
|-------------|----------|------------------------------|
| id          | INTEGER  | Primary Key (auto-increment) |
| title       | TEXT     | Movie title (required)       |
| description | TEXT     | Movie description (required) |
| year        | INTEGER  | Release year (optional)      |

The database and table are created automatically when the server starts if they
do not already exist.


## REST API Routes (CRUD)

| Method | Route              | Description                    |
|------|--------------------|--------------------------------|
| GET  | /api/movies        | Get all movies (sorted by ID)  |
| GET  | /api/movies/:id    | Get a movie by ID              |
| POST | /api/movies        | Create a new movie (JSON)      |
| PUT  | /api/movies/:id    | Update a movie by ID (JSON)    |
| DELETE | /api/movies/:id  | Delete a movie by ID           |

All API routes return JSON responses with proper HTTP status codes.


## Validation & Error Handling (Part 2)

- **200 OK** — successful GET, PUT, DELETE  
- **201 Created** — successful POST  
- **400 Bad Request** — invalid ID or missing fields  
- **404 Not Found** — movie not found  
- **500 Internal Server Error** — database or server error  


## Home Page API Test Links

The Home page includes direct links for quick API testing:
- `/api/movies`
- `/api/movies/1`


## Project Structure
movie-library/
├── public/
│ └── styles.css
├── views/
│ ├── index.html
│ ├── about.html
│ ├── contact.html
│ └── 404.html
├── movies.db
├── server.js
├── package.json
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