document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:3000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      firstname,
      lastname,
      password
    })
  });

  const data = await response.json();
  document.getElementById('message').textContent = data.message;

  if (response.status === 201) {
    // Redirect to login page after successful signup
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }
});