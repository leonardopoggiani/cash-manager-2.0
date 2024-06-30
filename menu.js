const { ipcRenderer } = require('electron');

async function loadMenu() {
  try {
    const dishes = await ipcRenderer.invoke('getMenu');
    console.log('Received dishes:', dishes);

    const menuContainer = document.getElementById('menuContainer');
    if (!menuContainer) {
      console.error('menuContainer element not found');
      return;
    }

    console.log('Clearing menuContainer');
    menuContainer.innerHTML = '';

    if (!Array.isArray(dishes) || dishes.length === 0) {
      console.log('No dishes in menu or invalid data, displaying message');
      menuContainer.innerHTML = '<p>Nessun piatto nel menu</p>';
    } else {
      console.log('Adding dishes to menu tables');
      const dishesByCategory = groupDishesByCategory(dishes);

      for (const [categoria, categoryDishes] of Object.entries(dishesByCategory)) {
        const categoryTable = createCategoryTable(categoria, categoryDishes);
        menuContainer.appendChild(categoryTable);
      }
    }

    console.log('Menu loading complete');
  } catch (error) {
    console.error('Error loading menu:', error);
  }
}

function groupDishesByCategory(dishes) {
  return dishes.reduce((acc, dish) => {
    if (dish && typeof dish === 'object' && dish.categoria) {
      if (!acc[dish.categoria]) {
        acc[dish.categoria] = [];
      }
      acc[dish.categoria].push(dish);
    }
    return acc;
  }, {});
}

function createCategoryTable(categoria, dishes) {
  const tableContainer = document.createElement('div');
  tableContainer.className = 'category-table-container';

  const categoryHeader = document.createElement('h4');
  categoryHeader.textContent = categoria;
  tableContainer.appendChild(categoryHeader);

  const table = document.createElement('table');
  table.className = 'menu-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
        <tr>
            <th>Nome</th>
            <th>Prezzo</th>
            <th>Disponibile</th>
            <th>Azioni</th>
        </tr>
    `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  dishes.forEach((dish) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
            <td>${dish.nome || 'Nome sconosciuto'}</td>
            <td>${typeof dish.prezzo === 'number' ? `€${dish.prezzo.toFixed(2)}` : 'N/D'}</td>
            <td>${dish.disponibile ? 'Sì' : 'No'}</td>
            <td>
                <button onclick="editDish(${dish.id})">Modifica</button>
                <button onclick="toggleDishAvailability(${dish.id})">
                    ${dish.disponibile ? 'Rendi non disponibile' : 'Rendi disponibile'}
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableContainer.appendChild(table);
  return tableContainer;
}

async function addDish(e) {
  e.preventDefault();
  const nome = document.getElementById('dishName').value;
  const prezzo = parseFloat(document.getElementById('dishPrice').value);
  const categoria = document.getElementById('dishCategory').value;
  const descrizione = document.getElementById('dishDescription').value;

  const result = await ipcRenderer.invoke('addDish', { nome, prezzo, categoria, descrizione });
  if (result.success) {
    await loadMenu();
    e.target.reset();
  } else {
    console.error('Error adding dish:', result.error);
  }
}

async function editDish(dishId) {
  // Implement edit functionality
  console.log('Edit dish:', dishId);
}

async function toggleDishAvailability(dishId) {
  const result = await ipcRenderer.invoke('toggleDishAvailability', dishId);
  if (result.success) {
    await loadMenu();
  } else {
    console.error('Error toggling dish availability:', result.error);
  }
}

function initializeMenu() {
  console.log('Initializing Menu module');

  const addDishForm = document.getElementById('addDishForm');
  const refreshMenuBtn = document.getElementById('refreshMenuBtn');

  if (addDishForm) {
    addDishForm.addEventListener('submit', addDish);
    console.log('Added event listener to addDishForm');
  } else {
    console.error('addDishForm not found');
  }

  if (refreshMenuBtn) {
    refreshMenuBtn.addEventListener('click', loadMenu);
    console.log('Added event listener to refreshMenuBtn');
  } else {
    console.error('refreshMenuBtn not found');
  }

  console.log('Loading initial menu');
  loadMenu();
}

module.exports = { initializeMenu, loadMenu, editDish, toggleDishAvailability };
