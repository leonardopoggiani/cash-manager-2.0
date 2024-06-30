const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = await ipcRenderer.invoke('login', { username, password });

    if (result.success) {
      messageDiv.textContent = 'Accesso effettuato con successo!';
      messageDiv.style.color = 'green';
      // TODO: Redirect to main application window
    } else {
      messageDiv.textContent = result.message;
      messageDiv.style.color = 'red';
    }
  });
});
