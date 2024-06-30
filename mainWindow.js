const { ipcRenderer } = require('electron');
const { initializeMagazzino } = require('./magazzino');

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.invoke('getCurrentUser').then((user) => {
    currentUser = user;
    updateUI();
  });

  document.getElementById('ordiniBtn').addEventListener('click', () => loadModule('ordini'));
  document.getElementById('menuBtn').addEventListener('click', () => loadModule('menu'));
  document.getElementById('magazzinoBtn').addEventListener('click', () => loadModule('magazzino'));
  document
    .getElementById('statisticheBtn')
    .addEventListener('click', () => loadModule('statistiche'));
  document.getElementById('logoutBtn').addEventListener('click', logout);
});

function updateUI() {
  const userInfo = document.getElementById('userInfo');
  userInfo.textContent = `Benvenuto, ${currentUser.username} (${currentUser.role})`;

  // Nascondi i pulsanti in base al ruolo
  if (currentUser.role !== 'Admin') {
    document.getElementById('statisticheBtn').style.display = 'none';
  }
}

function loadModule(moduleName) {
  console.log(`Loading module: ${moduleName}`);
  const content = document.getElementById('content');
  const magazzinoModule = document.getElementById('magazzinoModule');

  if (moduleName === 'magazzino') {
    console.log('Displaying Magazzino module');
    magazzinoModule.style.display = 'block';
    setTimeout(() => {
      initializeMagazzino();
    }, 0);
  } else {
    console.log('Hiding Magazzino module');
    magazzinoModule.style.display = 'none';
    content.innerHTML = `<h2>Modulo ${moduleName}</h2><p>Contenuto del modulo ${moduleName}...</p>`;
  }
}

function logout() {
  ipcRenderer.invoke('logout').then(() => {
    window.location.href = 'index.html';
  });
}
