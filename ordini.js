const { ipcRenderer } = require('electron');

let currentOrder = [];

async function initializeOrdini() {
  console.log('Initializing Ordini module');

  createOrderUI();

  const addToOrderBtn = document.getElementById('addToOrderBtn');
  const submitOrderBtn = document.getElementById('submitOrderBtn');

  // Load dishes
  loadDishes();

  const itemQuantityInput = document.getElementById('itemQuantity');
  itemQuantityInput.addEventListener('change', (event) => {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      event.target.value = '1';
    }
  });

  const dishes = await ipcRenderer.invoke('getDishes');
  populateDishSelect(dishes);

  addToOrderBtn.addEventListener('click', (event) => {
    event.preventDefault();
    addItemToOrder();
  });

  submitOrderBtn.addEventListener('click', submitOrder);

  loadOrders();
}

async function loadDishes() {
  try {
    const dishes = await ipcRenderer.invoke('getDishes');
    populateDishSelect(dishes);
  } catch (error) {
    console.error('Error loading dishes:', error);
  }
}

function populateDishSelect(dishes) {
  const dishSelect = document.getElementById('dishSelect');
  dishSelect.innerHTML = '<option value="">Seleziona un piatto</option>';
  dishes.forEach((dish) => {
    if (dish.disponibile) {
      const option = document.createElement('option');
      option.value = dish.id;
      option.textContent = `${dish.nome} - €${dish.prezzo.toFixed(2)}`;
      option.dataset.price = dish.prezzo;
      dishSelect.appendChild(option);
    }
  });
}

function addItemToOrder() {
  const dishSelect = document.getElementById('dishSelect');
  const itemQuantityInput = document.getElementById('itemQuantity');
  const selectedDish = dishSelect.options[dishSelect.selectedIndex];

  console.log('Selected dish:', selectedDish);
  console.log('Quantity input value:', itemQuantityInput.value);

  if (selectedDish.value) {
    const price = parseFloat(selectedDish.dataset.price);
    console.log('Parsed price:', price);

    if (isNaN(price)) {
      console.error('Invalid price for dish:', selectedDish.textContent);
      alert('Errore: prezzo non valido per questo piatto.');
      return;
    }

    let quantity = parseInt(itemQuantityInput.value, 10);
    console.log('Parsed quantity:', quantity);

    if (isNaN(quantity) || quantity <= 0) {
      console.log('Invalid quantity. Using default value of 1');
      quantity = 1;
      itemQuantityInput.value = '1';
    }

    const item = {
      id: parseInt(selectedDish.value, 10),
      name: selectedDish.textContent.split(' - ')[0],
      price: price,
      quantity: quantity,
    };

    console.log('Item to be added:', item);

    currentOrder.push(item);
    updateOrderDisplay();

    // Reset inputs
    itemQuantityInput.value = '1';
    dishSelect.selectedIndex = 0;
  } else {
    alert("Per favore, seleziona un piatto prima di aggiungerlo all'ordine.");
  }
}

async function submitOrder() {
  if (currentOrder.length === 0) {
    alert("Aggiungi almeno un piatto all'ordine prima di inviarlo.");
    return;
  }

  try {
    const inventoryCheck = await ipcRenderer.invoke('checkInventoryForOrder', currentOrder);
    if (!inventoryCheck.success) {
      alert(`Errore nell'inventario: ${inventoryCheck.error}`);
      return;
    }

    const order = {
      items: currentOrder,
      total: currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    const result = await ipcRenderer.invoke('submitOrder', order);
    if (result.success) {
      alert(`Ordine #${result.orderId} inviato con successo!`);
      currentOrder = [];
      updateOrderDisplay();
      loadOrders();
    } else {
      alert(`Errore nell'invio dell'ordine: ${result.error}`);
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    alert(`Errore nell'invio dell'ordine: ${error.message}`);
  }
}

async function loadOrders() {
  try {
    const orders = await ipcRenderer.invoke('getOrders');
    const orderListItems = document.getElementById('orderListItems');
    orderListItems.innerHTML = '';

    orders.forEach((order) => {
      const li = document.createElement('li');
      li.textContent = `Ordine #${order.id} - ${new Date(order.date).toLocaleString()} - €${order.total.toFixed(2)} - Stato: ${order.status}`;
      li.onclick = () => viewOrderDetails(order.id);
      orderListItems.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function viewOrderDetails(orderId) {
  try {
    const order = await ipcRenderer.invoke('getOrderDetails', orderId);
    if (!order) {
      alert('Ordine non trovato');
      return;
    }

    const items = order.items || []; // Use 'items' instead of 'OrderItems', and provide a default empty array

    const detailsHtml = `
      <h3>Dettagli Ordine #${order.id}</h3>
      <p>Data: ${new Date(order.date).toLocaleString()}</p>
      <p>Stato: ${order.status}</p>
      <p>Totale: €${order.total.toFixed(2)}</p>
      <h4>Articoli:</h4>
      <ul>
        ${items
          .map(
            (item) => `
          <li>${item.MenuItem.nome} x${item.quantity} - €${item.price.toFixed(2)}</li>
        `
          )
          .join('')}
      </ul>
      <button onclick="window.updateOrderStatus(${order.id}, 'completed')">Completa Ordine</button>
      <button onclick="window.updateOrderStatus(${order.id}, 'cancelled')">Annulla Ordine</button>
    `;

    const detailsContainer = document.getElementById('orderDetails');
    detailsContainer.innerHTML = detailsHtml;
    detailsContainer.style.display = 'block';
  } catch (error) {
    console.error('Error loading order details:', error);
    alert(`Errore nel caricamento dei dettagli dell'ordine: ${error.message}`);
  }
}

window.updateOrderStatus = updateOrderStatus;
async function updateOrderStatus(orderId, status) {
  try {
    const result = await ipcRenderer.invoke('updateOrderStatus', { orderId, status });
    if (result.success) {
      alert(`Stato dell'ordine aggiornato a: ${status}`);
      loadOrders(); // Refresh the order list
      viewOrderDetails(orderId); // Refresh the order details
    } else {
      alert(`Errore nell'aggiornamento dello stato dell'ordine: ${result.error}`);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    alert(`Errore nell'aggiornamento dello stato dell'ordine: ${error.message}`);
  }
}

function createOrderUI() {
  const orderForm = document.getElementById('newOrderForm');
  orderForm.innerHTML = `
    <h3>Nuovo Ordine</h3>
    <div class="order-form-grid">
      <select id="dishSelect"></select>
      <input type="number" id="itemQuantity" min="1" value="1" step="1">
      <button id="addToOrderBtn">Aggiungi</button>
    </div>
    <div id="currentOrderItems"></div>
    <div class="order-summary">
      <span>Totale: €<span id="orderTotal">0.00</span></span>
      <button id="submitOrderBtn">Invia Ordine</button>
    </div>
  `;
}

function updateOrderDisplay() {
  const currentOrderItems = document.getElementById('currentOrderItems');
  const orderTotal = document.getElementById('orderTotal');

  currentOrderItems.innerHTML = '';
  let total = 0;

  currentOrder.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'order-item';
    itemElement.innerHTML = `
      <span>${item.name} x${item.quantity}</span>
      <span>€${(item.price * item.quantity).toFixed(2)}</span>
      <button class="remove-item" data-index="${index}">Rimuovi</button>
    `;
    currentOrderItems.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  orderTotal.textContent = total.toFixed(2);
}

module.exports = {
  initializeOrdini,
};
