const { initializeMagazzino } = require('./magazzino.js');
const { initializeMenu } = require('./menu.js');
const { initializeOrdini } = require('./ordini.js');
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = document.getElementById('userInfo');
  userInfo.textContent = `Benvenuto, ${currentUser.username} (${currentUser.role})`;

  document
    .getElementById('ordiniBtn')
    .addEventListener('click', async () => await loadModule('ordini'));
  document
    .getElementById('menuBtn')
    .addEventListener('click', async () => await loadModule('menu'));
  document
    .getElementById('magazzinoBtn')
    .addEventListener('click', async () => await loadModule('magazzino'));
  document
    .getElementById('statisticheBtn')
    .addEventListener('click', async () => await loadModule('statistiche'));
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Load the default module (e.g., 'magazzino')
  await loadModule('magazzino');
});

function loadModule(moduleName) {
  console.log(`Loading module: ${moduleName}`);
  const content = document.getElementById('content');
  const modules = ['magazzino', 'menu', 'ordini', 'statistiche'];

  // Hide all modules
  modules.forEach((module) => {
    const moduleElement = document.getElementById(`${module}Module`);
    if (moduleElement) {
      moduleElement.style.display = 'none';
    }
  });

  // Show and initialize the selected module
  const selectedModule = document.getElementById(`${moduleName}Module`);
  if (selectedModule) {
    selectedModule.style.display = 'block';

    switch (moduleName) {
      case 'magazzino':
        initializeMagazzino();
        break;
      case 'menu':
        initializeMenu();
        break;
      case 'ordini':
        initializeOrdini();
        break;
      case 'statistiche':
        // Display a "Not implemented" message for this module
        selectedModule.innerHTML = `<h2>Modulo ${moduleName}</h2><p>Questo modulo non è ancora implementato.</p>`;
        break;
      default:
        console.error(`Module '${moduleName}' not recognized`);
        content.innerHTML = `<h2>Errore</h2><p>Modulo non riconosciuto</p>`;
    }
  } else {
    console.error(`Module '${moduleName}' not found`);
    content.innerHTML = `<h2>Errore</h2><p>Modulo non trovato</p>`;
  }
}

function logout() {
  ipcRenderer
    .invoke('logout')
    .then(() => {
      // Redirect to login page or close the window
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error('Error during logout:', error);
      alert('Error during logout. Please try again.');
    });
}

// Make sure currentUser is defined
let currentUser = { username: 'DefaultUser', role: 'DefaultRole' };

// Export functions that need to be accessed from other modules
module.exports = { loadModule };
