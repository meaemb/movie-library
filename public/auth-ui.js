async function checkAuthNavbar() {
  const res = await fetch('/api/auth/me');
  const data = await res.json();

  const authLinks = document.getElementById('authLinks');
  if (!authLinks) return;

  if (data.user) {
    authLinks.innerHTML = `
      <span class="muted">${data.user.email}</span>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    authLinks.innerHTML = `
      <a href="/login" class="login-link">Login</a>
    `;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

checkAuthNavbar();
