let currentEditId = null;
let deleteId = null;
let currentUser = null;

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
  const addSection = document.getElementById('addSection');
  const authLinks = document.getElementById('authLinks');

  if (currentUser) {
    addSection.style.display = 'block';
    authLinks.innerHTML = `
      <span class="muted">${currentUser.email}</span>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    addSection.style.display = 'none';
    authLinks.innerHTML = `
      <a href="/login" class="login-link">Login</a>
    `;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.reload();
}

/* =====================
   LOAD MOVIES
===================== */
async function loadMovies(query = '') {
  const res = await fetch('/api/movies' + query);
  const movies = await res.json();

  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';

  movies.forEach(m => {
    const actions = currentUser
      ? `
        <div class="actions">
          <button onclick="openEdit('${m._id}', '${escapeHtml(m.title)}', '${m.year ?? ''}', '${escapeHtml(m.description)}')">Edit</button>
          <button onclick="openDelete('${m._id}')">Delete</button>
        </div>
      `
      : `<span class="muted">Login required</span>`;

    grid.innerHTML += `
      <div class="movie-card">
        <h3>${m.title}</h3>
        <div class="year">${m.year ?? ''}</div>
        <p>${m.description}</p>
        ${actions}
      </div>
    `;
  });
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
      description: description.value
    })
  });

  e.target.reset();
  loadMovies();
});

/* =====================
   FILTER
===================== */
document.getElementById('filterBtn').onclick = () => {
  const year = filterYear.value;
  loadMovies(year ? `?year=${year}` : '');
};

/* =====================
   EDIT
===================== */
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: editTitle.value,
      year: editYear.value,
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
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

/* =====================
   UTILS
===================== */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =====================
   INIT
===================== */
(async function init() {
  await checkAuth();
  loadMovies();
})();
