document.getElementById('loginBtn').addEventListener('click', async e => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('errorMessage');

  if (!username || !password) {
    errorBox.textContent = 'Username and password are required';
    return;
  }

  errorBox.textContent = '';
  console.log('Submitting login:', username);

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    console.log('Login successful, redirecting');
    window.location.href = '/admin/dashboard.html';
  } catch (err) {
    console.log('Login error:', err.message);
    errorBox.textContent = err.message;
  }
});
