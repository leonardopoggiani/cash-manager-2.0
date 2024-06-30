const { initializeMagazzino } = require('./magazzino.js');
const { initializeMenu } = require('./menu.js');

document.addEventListener('DOMContentLoaded', () => {
  const userInfo = document.getElementById('userInfo');
  userInfo.textContent = `Benvenuto, ${currentUser.username} (${currentUser.role})`;

  document.getElementById('ordiniBtn').addEventListener('click', () => loadModule('ordini'));
  document.getElementById('menuBtn').addEventListener('click', () => loadModule('menu'));
  document.getElementById('magazzinoBtn').addEventListener('click', () => loadModule('magazzino'));
  document
    .getElementById('statisticheBtn')
    .addEventListener('click', () => loadModule('statistiche'));
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Load the default module (e.g., 'magazzino')
  loadModule('magazzino');
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
      case 'statistiche':
        // Display a "Not implemented" message for these modules
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
  // Implement logout functionality
  console.log('Logout clicked');
}

// Make sure currentUser is defined
let currentUser = { username: 'DefaultUser', role: 'DefaultRole' };

// Export functions that need to be accessed from other modules
module.exports = { loadModule };
