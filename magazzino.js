const { ipcRenderer } = require('electron');

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
          <th>Azioni</th>
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
          <td>
              <button class="edit-item" data-id="${item.id}">Modifica</button>
              <button class="update-quantity" data-id="${item.id}">Aggiorna Quantità</button>
              <button class="delete-item" data-id="${item.id}">Elimina</button>
          </td>
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

async function editMenuItem(itemId) {
  console.log('Opening edit dialog for item:', itemId);

  try {
    const item = await ipcRenderer.invoke('getMenuItem', itemId);
    if (!item) {
      console.error('Menu item not found');
      return;
    }

    const dialog = document.createElement('div');
    dialog.id = 'editMenuItemDialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.backgroundColor = 'rgba(0,0,0,0.5)';
    dialog.style.display = 'flex';
    dialog.style.alignItems = 'center';
    dialog.style.justifyContent = 'center';

    dialog.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 5px;">
        <h3>Modifica Articolo</h3>
        <input type="text" id="editItemName" value="${item.nome}" placeholder="Nome articolo">
        <input type="number" id="editItemPrice" value="${item.prezzo}" step="0.01" placeholder="Prezzo">
        <input type="number" id="editItemQuantity" value="${item.quantita}" placeholder="Quantità">
        <select id="editItemCategory">
          <option value="Antipasti" ${item.categoria === 'Antipasti' ? 'selected' : ''}>Antipasti</option>
          <option value="Dolci" ${item.categoria === 'Dolci' ? 'selected' : ''}>Dolci</option>
          <option value="Pizze" ${item.categoria === 'Pizze' ? 'selected' : ''}>Pizze</option>
          <option value="Bevande" ${item.categoria === 'Bevande' ? 'selected' : ''}>Bevande</option>
          <option value="Primi" ${item.categoria === 'Primi' ? 'selected' : ''}>Primi</option>
          <option value="Secondi" ${item.categoria === 'Secondi' ? 'selected' : ''}>Secondi</option>
          <option value="Altro" ${item.categoria === 'Altro' ? 'selected' : ''}>Altro</option>
        </select>
        <button id="confirmEdit">Conferma</button>
        <button id="cancelEdit">Annulla</button>
      </div>
    `;

    document.body.appendChild(dialog);

    const confirmEditHandler = async () => {
      const nome = document.getElementById('editItemName').value;
      const prezzo = parseFloat(document.getElementById('editItemPrice').value);
      const quantita = parseInt(document.getElementById('editItemQuantity').value);
      const categoria = document.getElementById('editItemCategory').value;

      try {
        const result = await ipcRenderer.invoke('updateMenuItem', {
          id: itemId,
          nome,
          prezzo,
          quantita,
          categoria,
        });

        if (result.success) {
          await loadInventory();
          removeDialog();
        } else {
          console.error('Error updating menu item:', result.error);
          alert(`Errore durante l'aggiornamento dell'articolo: ${result.error}`);
        }
      } catch (error) {
        console.error('Error updating menu item:', error);
        alert(`Errore durante l'aggiornamento dell'articolo: ${error.message}`);
      }
    };

    const cancelEditHandler = () => {
      removeDialog();
    };

    const removeDialog = () => {
      document.getElementById('confirmEdit').removeEventListener('click', confirmEditHandler);
      document.getElementById('cancelEdit').removeEventListener('click', cancelEditHandler);
      document.body.removeChild(dialog);
    };

    document.getElementById('confirmEdit').addEventListener('click', confirmEditHandler);
    document.getElementById('cancelEdit').addEventListener('click', cancelEditHandler);
  } catch (error) {
    console.error('Error editing menu item:', error);
    alert("Errore durante la modifica dell'articolo.");
  }
}

function updateMenuItemQuantity(itemId) {
  console.log('Opening quantity update dialog for item:', itemId);

  const dialog = document.createElement('div');
  dialog.id = 'updateQuantityDialog';
  dialog.style.position = 'fixed';
  dialog.style.top = '0';
  dialog.style.left = '0';
  dialog.style.width = '100%';
  dialog.style.height = '100%';
  dialog.style.backgroundColor = 'rgba(0,0,0,0.5)';
  dialog.style.display = 'flex';
  dialog.style.alignItems = 'center';
  dialog.style.justifyContent = 'center';

  dialog.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 5px;">
          <h3>Aggiorna Quantità</h3>
          <input type="number" id="newQuantity" min="0" step="1">
          <button id="confirmQuantity">Conferma</button>
          <button id="cancelQuantity">Annulla</button>
      </div>
  `;

  document.body.appendChild(dialog);

  const confirmQuantityHandler = async () => {
    const quantity = parseInt(document.getElementById('newQuantity').value);
    if (isNaN(quantity)) {
      alert('Per favore, inserisci un numero valido.');
      return;
    }
    try {
      const result = await ipcRenderer.invoke('updateMenuItemQuantity', {
        id: itemId,
        quantita: quantity,
      });
      if (result.success) {
        await loadInventory();
        removeDialog();
      } else {
        console.error('Error updating menu item quantity:', result.error);
        alert(`Errore durante l'aggiornamento della quantità: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating menu item quantity:', error);
      alert(`Errore durante l'aggiornamento della quantità: ${error.message}`);
    }
  };

  const cancelQuantityHandler = () => {
    removeDialog();
  };

  const removeDialog = () => {
    document.getElementById('confirmQuantity').removeEventListener('click', confirmQuantityHandler);
    document.getElementById('cancelQuantity').removeEventListener('click', cancelQuantityHandler);
    document.body.removeChild(dialog);
  };

  document.getElementById('confirmQuantity').addEventListener('click', confirmQuantityHandler);
  document.getElementById('cancelQuantity').addEventListener('click', cancelQuantityHandler);
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

async function deleteMenuItem(itemId) {
  if (confirm('Sei sicuro di voler eliminare questo articolo?')) {
    try {
      const result = await ipcRenderer.invoke('deleteMenuItem', itemId);
      if (result.success) {
        await loadInventory();
      } else {
        console.error('Error deleting menu item:', result.error);
        alert(`Errore durante l'eliminazione dell'articolo: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(`Errore durante l'eliminazione dell'articolo: ${error.message}`);
    }
  }
}

function initializeMagazzino() {
  console.log('Initializing Magazzino module');

  const addItemForm = document.getElementById('addItemForm');
  const refreshInventoryBtn = document.getElementById('refreshInventoryBtn');
  const inventoryContainer = document.getElementById('inventoryContainer');

  if (addItemForm) {
    addItemForm.addEventListener('submit', addItem);
    console.log('Added event listener to addItemForm');
  } else {
    console.error('addItemForm not found');
  }

  if (refreshInventoryBtn) {
    refreshInventoryBtn.addEventListener('click', loadInventory);
    console.log('Added event listener to refreshInventoryBtn');
  } else {
    console.error('refreshInventoryBtn not found');
  }

  if (inventoryContainer) {
    inventoryContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (target.tagName !== 'BUTTON') return; // Only handle button clicks

      const itemId = parseInt(target.getAttribute('data-id'), 10);
      if (isNaN(itemId)) return;

      if (target.classList.contains('edit-item')) {
        editMenuItem(itemId);
      } else if (target.classList.contains('update-quantity')) {
        updateMenuItemQuantity(itemId);
      } else if (target.classList.contains('delete-item')) {
        deleteMenuItem(itemId);
      }

      event.stopPropagation(); // Prevent event from bubbling up
    });
    console.log('Added event listeners for edit, update quantity, and delete buttons');
  } else {
    console.error('inventoryContainer not found');
  }

  console.log('Loading initial inventory');
  loadInventory();
}

module.exports = { loadInventory, addItem, updateQuantity, initializeMagazzino };
