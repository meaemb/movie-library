let currentEditId = null;
let deleteId = null;
let currentUser = null;
let currentPage = 1;
let totalPages = 1;

/* =====================
   AUTH CHECK
===================== */
async function checkAuth() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  currentUser = data.user;
  updateUIAuth();
}

/* =====================
   UI AUTH STATE
===================== */
function updateUIAuth() {
  const authLinks = document.getElementById('authLinks');
  if (!authLinks) return;

  if (currentUser) {
    authLinks.innerHTML = `
      <span class="email">${currentUser.email}</span>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    authLinks.innerHTML = `<a href="/login">Login</a>`;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.reload();
}

/* =====================
   LOAD MOVIES + PAGINATION
===================== */
async function loadMovies() {
  const res = await fetch(`/api/movies?page=${currentPage}`);
  const data = await res.json();

  const movies = data.items || [];
  totalPages = data.totalPages || 1;

  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';

  movies.forEach(m => {
    const canEdit =
      currentUser &&
      (currentUser.role === 'admin' ||
        String(m.ownerId) === String(currentUser.id));

    const actions = currentUser
      ? (canEdit
          ? `
            <div class="actions">
              <button onclick="openEdit(
                '${m._id}',
                '${escapeHtml(m.title)}',
                '${m.year ?? ''}',
                '${escapeHtml(m.genre ?? '')}',
                '${escapeHtml(m.director ?? '')}',
                '${m.durationMinutes ?? ''}',
                '${m.rating ?? ''}',
                '${escapeHtml(m.description)}'
              )">Edit</button>
              <button onclick="openDelete('${m._id}')">Delete</button>
            </div>
          `
          : `<span class="muted">Not allowed</span>`
        )
      : `<span class="muted">Login required</span>`;

    grid.innerHTML += `
      <div class="movie-card">
        <h3>${m.title}</h3>

        <div class="meta">
          <span>${m.year ?? '—'}</span> •
          <span>${m.genre ?? '—'}</span>
        </div>

        <p class="desc">${m.description}</p>

        <div class="details">
          <div><strong>Director:</strong> ${m.director ?? '—'}</div>
          <div><strong>Duration:</strong> ${m.durationMinutes ?? '—'} min</div>
          <div><strong>Rating:</strong> ⭐ ${m.rating ?? '—'}</div>
        </div>

        ${actions}
      </div>
    `;
  });

  renderPagination();
}

/* =====================
   PAGINATION UI
===================== */
function renderPagination() {
  const el = document.getElementById('pagination');
  if (!el) return;

  el.innerHTML = `
    <button ${currentPage === 1 ? 'disabled' : ''} onclick="prevPage()">Prev</button>
    <span>Page ${currentPage} / ${totalPages}</span>
    <button ${currentPage === totalPages ? 'disabled' : ''} onclick="nextPage()">Next</button>
  `;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadMovies();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    loadMovies();
  }
}

/* =====================
   ADD MOVIE
===================== */
document.getElementById('addForm').addEventListener('submit', async e => {
  e.preventDefault();

  await fetch('/api/movies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title.value,
      year: year.value,
      genre: genre.value,
      director: director.value,
      durationMinutes: durationMinutes.value,
      rating: rating.value,
      description: description.value
    })
  });

  e.target.reset();
  currentPage = 1;
  loadMovies();
});


/* =====================
   EDIT
===================== */
function openEdit(id, t, y, g, d, dur, r, desc) {
  currentEditId = id;
  editTitle.value = t;
  editYear.value = y;
  editGenre.value = g;
  editDirector.value = d;
  editDurationMinutes.value = dur;
  editRating.value = r;
  editDescription.value = desc;
  openModal('editModal');
}

saveEdit.onclick = async () => {
  await fetch('/api/movies/' + currentEditId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: editTitle.value,
      year: editYear.value,
      genre: editGenre.value,
      director: editDirector.value,
      durationMinutes: editDurationMinutes.value,
      rating: editRating.value,
      description: editDescription.value
    })
  });

  closeModal();
  loadMovies();
};

/* =====================
   DELETE
===================== */
function openDelete(id) {
  deleteId = id;
  openModal('deleteModal');
}

confirmDelete.onclick = async () => {
  await fetch('/api/movies/' + deleteId, { method: 'DELETE' });
  closeModal();
  loadMovies();
};

/* =====================
   MODALS
===================== */
function openModal(id) {
  overlay.classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
}

function closeModal() {
  overlay.classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m =>
    m.classList.add('hidden')
  );
}

/* =====================
   UTILS
===================== */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =====================
   INIT
===================== */
(async function init() {
  await checkAuth();
  loadMovies();
})();
