# Movie Library — Final Project (Production Version)

Movie Library is a full-stack web application built with **Node.js, Express, MongoDB Atlas, and Vanilla JavaScript**.

The project demonstrates:

- Secure authentication with bcrypt
- Sessions-based authorization
- Owner-based access control
- Role-Based Access Control (RBAC)
- Pagination & filtering
- Fully UI-based CRUD demo


# Final Project Overview

The application allows users to:

- View movies (public access)
- Login / Logout (sessions-based authentication)
- Create movies (authenticated users only)
- Edit/Delete movies (owner or admin only)
- Filter and paginate movies
- Demonstrate full security from UI (no Postman required)


# Team Roles

## Dilyara A. — Backend (Auth / Roles / Ownership)

### Responsibilities

- Modular backend structure:
  - `middleware/auth.js`
  - `routes/authRoutes.js`
  - `controllers/authController.js`

- Authentication:
  - bcrypt password hashing
  - express-session configuration
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/auth/me`

- Authorization:
  - `requireAuth` middleware
  - `requireOwnerOrAdmin` middleware
  - Owner validation on PUT / DELETE
  - Role stored in `req.session.user.role`
  - Admin role support

### Result

- User can modify only their own movies
- Admin can modify all movies
- Owner access + RBAC fully implemented


## Kamila A. — Database & API Logic

### Responsibilities

- Production-like API structure
- 2 related collections (`users`, `movies`)
- ownerId relation between collections
- Pagination & filtering:
GET /api/movies?page=&limit=&year=&search=

Returns:

{
page,
limit,
total,
totalPages,
items
}


### Extended Movie Fields

- title
- description
- year
- genre
- director
- durationMinutes
- rating
- ownerId
- createdAt

### Validation & Status Codes

- 400 — Bad Request
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not Found
- 500 — Server Error

### Result

- 2 related collections
- Filtering & pagination
- 5–8 domain fields
- Production-ready API


## Begina M. — Frontend/UI & Defense

### Responsibilities

- Full UI-based demo (no Postman)

### UI Features

- Add/Edit forms with:
  - genre
  - director
  - durationMinutes
  - rating

- Role-based UI logic:
  - Hide Edit/Delete if not owner/admin
  - Display "Owner: you / other"
  - Show user role in navbar

- Pagination UI:
  - Prev / Next buttons

- Filtering UI:
  - Search by title
  - Filter by year

### Defense Scenario

1. Guest → cannot CRUD
2. User → CRUD only own movies
3. Admin → CRUD any movie

Explains:
- Sessions vs cookies
- HttpOnly & Secure flags
- Authentication vs Authorization
- Owner access vs RBAC


# Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- MongoDB Native Driver
- express-session
- bcrypt
- dotenv
- HTML5
- CSS3
- Vanilla JavaScript


# Authentication & Security

- Password hashing with bcrypt
- Server-side sessions
- Session ID stored in HttpOnly cookie
- Protected routes via middleware
- Owner validation
- Role-Based Access Control


# Database Design

## Database
movie_library


## Movies Collection

{
_id: ObjectId,
title: String,
description: String,
year: Number,
genre: String,
director: String,
durationMinutes: Number,
rating: Number,
ownerId: String,
createdAt: Date
}


## Users Collection

{
_id: ObjectId,
email: String,
passwordHash: String,
role: "user" | "admin",
createdAt: Date
}



# REST API Routes

## Authentication

| Method | Route | Description |
|--------|--------|------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current session |

## Movies

| Method | Route | Description |
|--------|--------|------------|
| GET | /api/movies | Get movies (pagination + filtering) |
| POST | /api/movies | Create movie (auth required) |
| PUT | /api/movies/:id | Update movie (owner/admin) |
| DELETE | /api/movies/:id | Delete movie (owner/admin) |


# Environment Variables

Create `.env` file:

PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/movie_library
SESSION_SECRET=your_secret_key


`.env` must be added to `.gitignore`.


#  Project Structure


movie-library/
├── controllers/
│ └── authController.js
├── middleware/
│ └── auth.js
├── routes/
│ └── authRoutes.js
├── public/
│ ├── styles.css
│ ├── movies.js
│ └── auth-ui.js
├── views/
│ ├── index.html
│ ├── login.html
│ ├── about.html
│ ├── contact.html
│ └── 404.html
├── server.js
├── seedMovies.js
├── seedAdmin.js
├── package.json
└── README.md


# Installation & Run

git clone https://github.com/your-username/movie-library.git
cd movie-library
npm install
node server.js


Open in browser:

http://localhost:3000


# Final Result

- Authentication + bcrypt
- Owner-based access
- Role-Based Access Control
- Pagination & Filtering
- Protected API endpoints
- Full UI demonstration
- Ready for defense