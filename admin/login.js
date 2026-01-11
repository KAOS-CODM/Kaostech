document.getElementById('adminLoginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('errorMessage');

  errorBox.textContent = '';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    errorBox.textContent = err.message;
  }
});
