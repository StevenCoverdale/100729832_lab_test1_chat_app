document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  document.getElementById('message').textContent = data.message;

  if (response.status === 200) {
    // Save user info for chat page
    localStorage.setItem('username', data.username);
    localStorage.setItem('firstname', data.firstname);
    localStorage.setItem('lastname', data.lastname);

    // Redirect to chat page
    setTimeout(() => {
      window.location.href = 'chat.html';
    }, 1000);
  }
});