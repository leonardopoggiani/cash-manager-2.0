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
          <th>Ingredienti</th>
          <th>Disponibile</th>
          <th>Azioni</th>
      </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  dishes.forEach((dish) => {
    const tr = document.createElement('tr');
    const ingredients = dish.menuItems
      .map((item) => `${item.nome} (${item.DishMenuItem.quantita})`)
      .join(', ');
    tr.innerHTML = `
        <td>${dish.nome || 'Nome sconosciuto'}</td>
        <td>${typeof dish.prezzo === 'number' ? `€${dish.prezzo.toFixed(2)}` : 'N/D'}</td>
        <td>${ingredients}</td>
        <td>${dish.disponibile ? 'Sì' : 'No'}</td>
        <td>
            <button class="edit-dish" data-id="${dish.id}">Modifica</button>
            <button class="toggle-availability" data-id="${dish.id}">
                ${dish.disponibile ? 'Rendi non disponibile' : 'Rendi disponibile'}
            </button>
            <button class="check-availability" data-id="${dish.id}">Controlla disponibilità</button>
            <button class="delete-dish" data-id="${dish.id}">Elimina</button>
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
  const nome = document.getElementById('dishName').value.trim();
  const prezzo = parseFloat(document.getElementById('dishPrice').value);
  const categoria = document.getElementById('dishCategory').value;
  const descrizione = document.getElementById('dishDescription').value.trim();
  const hasCommonDependency = document.getElementById('dishCommonDependency').checked;

  const ingredients = getSelectedIngredients();

  if (!nome || isNaN(prezzo) || !categoria || ingredients.length === 0) {
    alert('Per favore, compila tutti i campi obbligatori e aggiungi almeno un ingrediente.');
    return;
  }

  const result = await ipcRenderer.invoke('addDish', {
    nome,
    prezzo,
    categoria,
    descrizione,
    hasCommonDependency,
    ingredients,
  });
  if (result.success) {
    await loadMenu();
    e.target.reset();
    clearIngredientRows();
  } else {
    console.error('Error adding dish:', result.error);
    alert(`Errore durante l'aggiunta del piatto: ${result.error}`);
  }
}

function clearIngredientRows() {
  const container = document.getElementById('ingredientContainer');
  if (container) {
    container.innerHTML = '';
    addIngredientRow(container, false);
  } else {
    console.error('Ingredient container not found');
  }
}

function getSelectedIngredients() {
  const ingredients = [];
  const ingredientRows = document.querySelectorAll('#ingredientContainer .ingredient-row');
  ingredientRows.forEach((row) => {
    const select = row.querySelector('.ingredient-select');
    const quantity = row.querySelector('.ingredient-quantity');
    if (select && quantity && select.value && quantity.value) {
      ingredients.push({
        itemId: select.value,
        quantity: parseInt(quantity.value, 10),
      });
    }
  });
  return ingredients;
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

async function loadMenuItems() {
  try {
    const menuItems = await ipcRenderer.invoke('getMenuItems');
    const ingredientSelect = document.getElementById('ingredientSelect');
    const editIngredientSelect = document.getElementById('editIngredientSelect');
    const categorySelect = document.getElementById('dishCategory');
    const editCategorySelect = document.getElementById('editDishCategory');

    const updateSelect = (select, items, defaultOption = '') => {
      if (select) {
        select.innerHTML = defaultOption ? `<option value="">${defaultOption}</option>` : '';
        items.forEach((item) => {
          const option = document.createElement('option');
          option.value = item.id || item;
          option.textContent = item.nome ? `${item.nome} (${item.categoria})` : item;
          select.appendChild(option);
        });
      }
    };

    const categories = new Set([
      'Antipasti',
      'Dolci',
      'Pizze',
      'Bevande',
      'Primi',
      'Secondi',
      'Altro',
    ]);
    menuItems.forEach((item) => {
      if (item.categoria) categories.add(item.categoria);
    });

    updateSelect(ingredientSelect, menuItems, 'Seleziona ingrediente');
    updateSelect(editIngredientSelect, menuItems, 'Seleziona ingrediente');
    updateSelect(categorySelect, Array.from(categories), 'Seleziona categoria');
    updateSelect(editCategorySelect, Array.from(categories));
  } catch (error) {
    console.error('Error loading menu items:', error);
  }
}

async function deleteDish(dishId) {
  if (confirm('Sei sicuro di voler eliminare questo piatto?')) {
    try {
      const result = await ipcRenderer.invoke('deleteDish', dishId);
      if (result.success) {
        await loadMenu();
      } else {
        console.error('Error deleting dish:', result.error);
        alert(`Errore durante l'eliminazione del piatto: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert(`Errore durante l'eliminazione del piatto: ${error.message}`);
    }
  }
}

async function initializeMenu() {
  console.log('Initializing Menu module');

  const addDishForm = document.getElementById('addDishForm');
  const refreshMenuBtn = document.getElementById('refreshMenuBtn');
  const addIngredientBtn = document.getElementById('addIngredientBtn');
  const menuContainer = document.getElementById('menuContainer');
  const ingredientContainer = document.getElementById('ingredientContainer');

  if (addDishForm) {
    addDishForm.addEventListener('submit', addDish);
  } else {
    console.error('addDishForm not found');
  }

  if (refreshMenuBtn) {
    refreshMenuBtn.addEventListener('click', loadMenu);
  } else {
    console.error('refreshMenuBtn not found');
  }

  if (addIngredientBtn && ingredientContainer) {
    addIngredientBtn.addEventListener('click', () => addIngredientRow(ingredientContainer));
  } else {
    console.error('addIngredientBtn or ingredientContainer not found');
  }

  if (menuContainer) {
    menuContainer.addEventListener('click', handleMenuActions);
  } else {
    console.error('menuContainer not found');
  }

  if (ingredientContainer) {
    clearIngredientRows(); // This will add the initial row
  } else {
    console.error('ingredientContainer not found');
  }

  await loadMenuItems(); // Make sure this is called first

  if (ingredientContainer) {
    clearIngredientRows(); // This will add the initial row
  } else {
    console.error('ingredientContainer not found');
  }

  loadMenu();
}

function handleMenuActions(event) {
  const target = event.target;
  const dishId = parseInt(target.dataset.id, 10);

  if (isNaN(dishId)) return;

  if (target.classList.contains('edit-dish')) {
    editDish(dishId);
  } else if (target.classList.contains('toggle-availability')) {
    toggleDishAvailability(dishId);
  } else if (target.classList.contains('check-availability')) {
    checkDishAvailability(dishId);
  } else if (target.classList.contains('delete-dish')) {
    deleteDish(dishId);
  }
}

function setupUpdateDishDialogListeners(dialog, dish) {
  const addEditIngredientBtn = dialog.querySelector('#addEditIngredientBtn');
  const editIngredientContainer = dialog.querySelector('#editIngredientContainer');

  if (addEditIngredientBtn && editIngredientContainer) {
    addEditIngredientBtn.addEventListener('click', () =>
      addIngredientRow(editIngredientContainer, true)
    );
  } else {
    console.error('Add ingredient button or container not found in the dialog');
  }
  editIngredientContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-ingredient')) {
      e.target.closest('.ingredient-row').remove();
    }
  });

  dialog.querySelector('#confirmEditDish').addEventListener('click', async () => {
    const updatedDish = {
      id: dish.id,
      nome: dialog.querySelector('#editDishName').value,
      prezzo: parseFloat(dialog.querySelector('#editDishPrice').value),
      categoria: dialog.querySelector('#editDishCategory').value,
      descrizione: dialog.querySelector('#editDishDescription').value,
      hasCommonDependency: dialog.querySelector('#editDishCommonDependency').checked,
      ingredients: Array.from(editIngredientContainer.querySelectorAll('.ingredient-row')).map(
        (row) => ({
          itemId: row.querySelector('.ingredient-select').value,
          quantity: parseInt(row.querySelector('.ingredient-quantity').value),
        })
      ),
    };

    try {
      const result = await ipcRenderer.invoke('updateDish', updatedDish);
      if (result.success) {
        await loadMenu();
        removeDialog();
      } else {
        alert(`Error updating dish: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating dish:', error);
      alert(`Error updating dish: ${error.message}`);
    }
  });

  dialog.querySelector('#cancelEditDish').addEventListener('click', removeDialog);

  function removeDialog() {
    if (document.body.contains(dialog)) {
      document.body.removeChild(dialog);
    }
  }

  const editIngredientSelect = dialog.querySelector('#editIngredientSelect');
  if (editIngredientSelect) {
    const ingredientSelects = dialog.querySelectorAll('.ingredient-select');
    ingredientSelects.forEach((select) => {
      const options = Array.from(editIngredientSelect.options);
      options.forEach((option) => {
        if (option.value !== select.dataset.id) {
          select.appendChild(option.cloneNode(true));
        }
      });
    });
  }
}

async function editDish(dishId) {
  try {
    const dish = await ipcRenderer.invoke('getDish', dishId);
    if (!dish) {
      console.error('Dish not found');
      return;
    }

    const dialog = createUpdateDishDialog(dish);
    document.body.appendChild(dialog);

    setupUpdateDishDialogListeners(dialog, dish);
  } catch (error) {
    console.error('Error editing dish:', error);
    alert('Errore durante la modifica del piatto.');
  }
}

function createUpdateDishDialog(dish) {
  const dialog = document.createElement('div');
  dialog.id = 'updateDishDialog';
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
    <div style="background: white; padding: 20px; border-radius: 5px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;">
      <h3>Modifica Piatto</h3>
      <input type="text" id="editDishName" value="${dish.nome}" placeholder="Nome piatto">
      <input type="number" id="editDishPrice" value="${dish.prezzo}" step="0.01" placeholder="Prezzo">
      <select id="editDishCategory">
        ${['Antipasti', 'Dolci', 'Pizze', 'Bevande', 'Primi', 'Secondi', 'Altro']
          .map(
            (cat) =>
              `<option value="${cat}" ${dish.categoria === cat ? 'selected' : ''}>${cat}</option>`
          )
          .join('')}
      </select>
      <textarea id="editDishDescription" placeholder="Descrizione">${dish.descrizione || ''}</textarea>
      <div>
        <label>
          <input type="checkbox" id="editDishCommonDependency" ${dish.hasCommonDependency ? 'checked' : ''}>
          Ha dipendenza comune (es. impasto pizza)
        </label>
      </div>
      <select id="editIngredientSelect" style="display: none;">
        <option value="">Seleziona ingrediente</option>
      </select>
      <div id="editIngredientContainer">
        <h4>Ingredienti</h4>
        ${dish.menuItems
          .map(
            (item) => `
          <div class="ingredient-row">
            <select class="ingredient-select" data-id="${item.id}">
              <option value="${item.id}">${item.nome}</option>
            </select>
            <input type="number" class="ingredient-quantity" value="${item.DishMenuItem.quantita}" min="1">
            <button type="button" class="remove-ingredient">Rimuovi</button>
          </div>
        `
          )
          .join('')}
      </div>
      <button type="button" id="addEditIngredientBtn">Aggiungi Ingrediente</button>
      <button id="confirmEditDish">Conferma</button>
      <button id="cancelEditDish">Annulla</button>
    </div>
  `;

  return dialog;
}

function addIngredientRow(container, isEditMode = false) {
  if (!container) {
    console.error('Ingredient container not provided');
    return;
  }

  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <select class="ingredient-select" required>
      <option value="">Seleziona ingrediente</option>
    </select>
    <input type="number" class="ingredient-quantity" min="1" required placeholder="Quantità">
    <button type="button" class="remove-ingredient">Rimuovi</button>
  `;
  container.appendChild(row);

  const newSelect = row.querySelector('.ingredient-select');
  const mainSelect = isEditMode
    ? document.getElementById('editIngredientSelect')
    : document.getElementById('ingredientSelect');

  if (mainSelect && newSelect) {
    Array.from(mainSelect.options).forEach((opt) => {
      if (opt.value !== '') {
        newSelect.add(opt.cloneNode(true));
      }
    });
  } else {
    console.error('Main ingredient select or new select not found');
    console.log('isEditMode:', isEditMode);
    console.log('mainSelect:', mainSelect);
    console.log('newSelect:', newSelect);
  }

  row.querySelector('.remove-ingredient').addEventListener('click', () => {
    container.removeChild(row);
  });
}

async function checkDishAvailability(dishId) {
  const result = await ipcRenderer.invoke('checkDishAvailability', dishId);
  if (result.available) {
    alert(`Il piatto è disponibile. Quantità massima: ${result.maxQuantity}`);
  } else {
    alert(`Il piatto non è disponibile. Motivo: ${result.reason}`);
  }
}

async function toggleDishAvailability(dishId) {
  try {
    const result = await ipcRenderer.invoke('toggleDishAvailability', dishId);
    if (result.success) {
      await loadMenu();
    } else {
      console.error('Error toggling dish availability:', result.error);
      alert("Errore durante l'aggiornamento della disponibilità del piatto.");
    }
  } catch (error) {
    console.error('Error toggling dish availability:', error);
    alert("Errore durante l'aggiornamento della disponibilità del piatto.");
  }
}

module.exports = {
  initializeMenu,
  loadMenu,
  editDish,
  toggleDishAvailability,
  checkDishAvailability,
};
