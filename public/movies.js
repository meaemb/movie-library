const grid = document.getElementById('moviesGrid');
const countEl = document.getElementById('movieCount');

// LOAD MOVIES
async function loadMovies(query = '') {
  const res = await fetch('/api/movies' + query);
  const movies = await res.json();

  grid.innerHTML = '';
  countEl.textContent = movies.length;

  movies.forEach(movie => {
    grid.innerHTML += `
      <div class="movie-card">
        <div class="card-top">
          <h3>${movie.title}</h3>
          <span class="year">${movie.year ?? ''}</span>
        </div>

        <div class="rating">⭐ ⭐ ⭐ ⭐ ☆</div>

        <p>${movie.description}</p>

        <div class="actions">
          <button onclick="editMovie('${movie._id}')">Edit</button>
          <button onclick="deleteMovie('${movie._id}')">Delete</button>
        </div>
      </div>
    `;
  });
}

// ADD
document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();

  await fetch('/api/movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title.value,
      description: description.value,
      year: year.value
    })
  });

  e.target.reset();
  loadMovies();
});

// DELETE
async function deleteMovie(id) {
  if (!confirm('Delete this movie?')) return;
  await fetch('/api/movies/' + id, { method: 'DELETE' });
  loadMovies();
}

// UPDATE
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

// FILTER
document.getElementById('filterBtn').addEventListener('click', () => {
  const year = document.getElementById('filterYear').value;
  loadMovies(year ? `?year=${year}` : '');
});

loadMovies();
