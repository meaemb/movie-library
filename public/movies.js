// LOAD ALL MOVIES (GET)
async function loadMovies(query = '') {
  const res = await fetch('/api/movies' + query);
  const movies = await res.json();

  const table = document.getElementById('moviesTable');
  table.innerHTML = '';

  movies.forEach(movie => {
    table.innerHTML += `
      <tr>
        <td>${movie.title}</td>
        <td>${movie.description}</td>
        <td>${movie.year ?? ''}</td>
        <td>
          <div class="actions">
            <button onclick="editMovie('${movie._id}')">Edit</button>
            <button onclick="deleteMovie('${movie._id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}


// ADD MOVIE (POST)
document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const year = document.getElementById('year').value;

  await fetch('/api/movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, year })
  });

  e.target.reset();
  loadMovies();
});


// DELETE MOVIE (DELETE)
async function deleteMovie(id) {
  if (!confirm('Delete this movie?')) return;

  await fetch('/api/movies/' + id, {
    method: 'DELETE'
  });

  loadMovies();
}


// UPDATE MOVIE (PUT)
async function editMovie(id) {
  const title = prompt('New title');
  const description = prompt('New description');
  const year = prompt('New year');

  if (!title || !description) return;

  await fetch('/api/movies/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, year })
  });

  loadMovies();
}


// FILTER & SORT
document.getElementById('filterForm').addEventListener('submit', e => {
  e.preventDefault();

  const year = document.getElementById('filterYear').value;
  const sort = document.getElementById('sortField').value;

  let query = '?';

  if (year) query += `year=${year}&`;
  if (sort) query += `sort=${sort}`;

  loadMovies(query);
});


// INITIAL LOAD
loadMovies();
