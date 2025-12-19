#  Movie Library — Web Application
Minimalist Node.js & Express.js web application serving as a prototype for a movie catalog website.

Movie Library is a clean and simple web application built using Node.js and Express.js.
It demonstrates basic server setup, static file handling, and a well-organized project structure.
Perfect as a starting point for adding movie data, multiple pages, or API functionality.

## Team Members
- **Begina M. (SE-2427)**  
  Express server setup, main GET routes (`/`, `/about`), project structure.

- **Dilyara A. (SE-2427)**  
  Contact page implementation, HTML form, POST `/contact` route handling.

- **Kamila A. (SE-2427)**  
  Custom 404 error page, error-handling middleware, navigation consistency across pages.

## Project Purpose
- Set up a working Express server
- Serve static CSS files for styling
- Maintain a clear and expandable folder structure
- Provide a prototype for a movie library website

## Technologies Used
- Node.js – server-side JavaScript platform
- Express.js – web framework for routing and server logic
- HTML5 – page structure
- CSS3 – styling

##  Project Structure
movie-library/                          
├── public/                  
│   └── styles.css               
├── views/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   └── 404.html                 
├── server.js                   
├── package.json                  
└── README.md    

## Currently implemented features:
- A functioning Express.js server running on port 3000
- Serving static files such as CSS from the 'public' folder
- A main landing page (index.html) with project description
- Organized folder structure for scalability

## Application Routes

- `/` — Home page  
- `/about` — About page  
- `/contact` — Contact page (GET + POST)  
- Any other route — Custom 404 page

## Contact Form Handling

The contact page includes an HTML form that sends data using a POST request.
Form data is processed on the server using Express middleware and `req.body`.

## Error Handling

The application includes a custom 404 error page.
If a user navigates to a non-existing route, the server responds with a 404 page.


## Installation & Run Instructions

1. Clone the repository:

git clone https://github.com/meaemb/movie-library.git

2. Navigate to the project folder:

cd movie-library

3. Install dependencies:

npm install

4. Run the server:

node server.js

5. Open the application in your browser:

http://localhost:3000

## Roadmap of Future Steps

- Week 1: Express.js setup, landing page, project structure
- Week 2: Form creation and POST routes
- Week 3: Database integration (e.g., MongoDB)
- Week 4: UI improvements and additional pages

## Conclusion
This is the initial version of the Movie Library project. 
The current focus was on setting up a working server, static file hosting, 
and a clean project structure. Future development will include 
dynamic content, database integration, and enhanced user interaction.
