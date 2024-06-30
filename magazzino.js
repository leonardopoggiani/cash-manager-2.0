const { ipcRenderer } = require('electron');

const categories = ['Antipasti', 'Primi', 'Secondi', 'Dolci', 'Pizze', 'Bevande', 'Altro'];

async function loadInventory() {
  try {
    const items = await ipcRenderer.invoke('getInventory');
    console.log('Received items:', items);

    const inventoryContainer = document.getElementById('inventoryContainer');
    if (!inventoryContainer) {
      console.error('inventoryContainer element not found');
      return;
    }

    console.log('Clearing inventoryContainer');
    inventoryContainer.innerHTML = '';

    if (!Array.isArray(items) || items.length === 0) {
      console.log('No items in inventory or invalid data, displaying message');
      inventoryContainer.innerHTML = '<p>Nessun articolo nel magazzino</p>';
    } else {
      console.log('Adding items to inventory tables');
      const itemsByCategory = groupItemsByCategory(items);

      for (const [categoria, categoryItems] of Object.entries(itemsByCategory)) {
        const categoryTable = createCategoryTable(categoria, categoryItems);
        inventoryContainer.appendChild(categoryTable);
      }
    }

    updateItemDropdown(items);
    console.log('Inventory loading complete');
  } catch (error) {
    console.error('Error loading inventory:', error);
  }
}

function groupItemsByCategory(items) {
  return items.reduce((acc, item) => {
    if (item && typeof item === 'object' && item.categoria) {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
    }
    return acc;
  }, {});
}

function createCategoryTable(categoria, items) {
  const tableContainer = document.createElement('div');
  tableContainer.className = 'category-table-container';

  const categoryHeader = document.createElement('h4');
  categoryHeader.textContent = categoria;
  tableContainer.appendChild(categoryHeader);

  const table = document.createElement('table');
  table.className = 'inventory-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
      <tr>
          <th>Nome</th>
          <th>Quantità</th>
          <th>Prezzo</th>
      </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
          <td>${item.nome || 'Nome sconosciuto'}</td>
          <td>${typeof item.quantita === 'number' ? item.quantita : 'N/D'}</td>
          <td>${typeof item.prezzo === 'number' ? `€${item.prezzo.toFixed(2)}` : 'N/D'}</td>
      `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableContainer.appendChild(table);
  return tableContainer;
}

function updateItemDropdown(items) {
  const updateItemSelect = document.getElementById('updateItemSelect');
  if (!updateItemSelect) {
    console.error('updateItemSelect element not found');
    return;
  }
  updateItemSelect.innerHTML = '<option value="">Seleziona articolo</option>';
  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (item && item.nome) {
        const option = document.createElement('option');
        option.value = item.nome;
        option.textContent = item.nome;
        updateItemSelect.appendChild(option);
      }
    });
  }
}
async function addItem(e) {
  e.preventDefault();
  const nome = document.getElementById('itemName').value;
  const prezzo = parseFloat(document.getElementById('itemPrice').value);
  const quantita = parseInt(document.getElementById('itemQuantity').value);
  const categoria = document.getElementById('itemCategory').value;
  await ipcRenderer.invoke('addMenuItem', { nome, prezzo, quantita, categoria });
  await loadInventory();
  e.target.reset();
}

async function updateQuantity(e) {
  e.preventDefault();
  const nome = document.getElementById('updateItemSelect').value;
  const quantita = parseInt(document.getElementById('updateItemQuantity').value);
  await ipcRenderer.invoke('updateMenuItemQuantity', { nome, quantita });
  await loadInventory();
  e.target.reset();
}

function initializeMagazzino() {
  console.log('Initializing Magazzino module');

  const addItemForm = document.getElementById('addItemForm');
  const updateQuantityForm = document.getElementById('updateQuantityForm');
  const refreshInventoryBtn = document.getElementById('refreshInventoryBtn');
  const itemCategorySelect = document.getElementById('itemCategory');

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    itemCategorySelect.appendChild(option);
  });

  if (addItemForm) {
    addItemForm.addEventListener('submit', addItem);
    console.log('Added event listener to addItemForm');
  } else {
    console.error('addItemForm not found');
  }

  if (updateQuantityForm) {
    updateQuantityForm.addEventListener('submit', updateQuantity);
    console.log('Added event listener to updateQuantityForm');
  } else {
    console.error('updateQuantityForm not found');
  }

  if (refreshInventoryBtn) {
    refreshInventoryBtn.addEventListener('click', loadInventory);
    console.log('Added event listener to refreshInventoryBtn');
  } else {
    console.error('refreshInventoryBtn not found');
  }

  console.log('Loading initial inventory');
  loadInventory();
}

module.exports = { loadInventory, addItem, updateQuantity, initializeMagazzino };
