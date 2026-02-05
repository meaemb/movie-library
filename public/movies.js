let currentEditId = null;
let deleteId = null;

async function loadMovies(query = '') {
  const res = await fetch('/api/movies' + query);
  const movies = await res.json();

  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';

  movies.forEach(m => {
    grid.innerHTML += `
      <div class="movie-card">
        <h3>${m.title}</h3>
        <div class="year">${m.year ?? ''}</div>
        <p>${m.description}</p>
        <div class="actions">
          <button onclick="openEdit('${m._id}', '${m.title}', '${m.year}', '${m.description}')">Edit</button>
          <button onclick="openDelete('${m._id}')">Delete</button>
        </div>
      </div>
    `;
  });
}

/* ADD */
document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();

  await fetch('/api/movies', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: title.value,
      year: year.value,
      description: description.value
    })
  });

  e.target.reset();
  loadMovies();
});

/* FILTER */
document.getElementById('filterBtn').onclick = () => {
  const year = filterYear.value;
  loadMovies(year ? `?year=${year}` : '');
};

/* EDIT */
function openEdit(id, t, y, d) {
  currentEditId = id;
  editTitle.value = t;
  editYear.value = y;
  editDescription.value = d;
  openModal('editModal');
}

saveEdit.onclick = async () => {
  await fetch('/api/movies/' + currentEditId, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: editTitle.value,
      year: editYear.value,
      description: editDescription.value
    })
  });

  closeModal();
  loadMovies();
};

/* DELETE */
function openDelete(id) {
  deleteId = id;
  openModal('deleteModal');
}

confirmDelete.onclick = async () => {
  await fetch('/api/movies/' + deleteId, { method: 'DELETE' });
  closeModal();
  loadMovies();
};

/* MODAL HELPERS */
function openModal(id) {
  overlay.classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
}

function closeModal() {
  overlay.classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

loadMovies();
