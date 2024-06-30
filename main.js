const { app, BrowserWindow, ipcMain } = require('electron');
const sequelize = require('./database/database');
const { authenticateUser } = require('./auth/auth');
const {
  Dish,
  MenuItem,
  DishMenuItem,
  checkAssociations,
  Order,
  OrderItem,
  syncModels,
  SyncLog,
} = require('./models');
const Discover = require('node-discover');

let mainWindow;
let currentUser = null;
let discover;

async function createWindow() {
  await syncModels();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  discover = Discover();

  discover.on('promotion', () => {
    console.log('This node became the master.');
    startSync();
  });

  discover.on('demotion', () => {
    console.log('This node is no longer the master.');
    stopSync();
  });

  discover.on('added', (node) => {
    console.log('A new node has been added:', node.address);
    syncWith(node);
  });
}

app.whenReady().then(async () => {
  try {
    await checkAssociations();
    await sequelize.authenticate();
    console.log('Connessione al database stabilita con successo.');

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    createWindow();
  } catch (error) {
    console.error('Impossibile connettersi al database:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('login', async (event, { username, password }) => {
  const result = await authenticateUser(username, password);
  if (result.success) {
    currentUser = result.user;
    mainWindow.loadFile('mainWindow.html');
  }
  return result;
});

ipcMain.handle('getCurrentUser', () => {
  return currentUser;
});

ipcMain.handle('getInventory', async () => {
  try {
    const items = await MenuItem.findAll();
    console.log(
      'Fetched inventory items:',
      items.map((item) => item.toJSON())
    );
    return items.map((item) => item.toJSON());
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
});

ipcMain.handle('addMenuItem', async (event, item) => {
  try {
    await MenuItem.create(item);
    return { success: true };
  } catch (error) {
    console.error('Error adding menu item:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('getMenu', async () => {
  try {
    const dishes = await Dish.findAll({
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          through: { attributes: ['quantita', 'isCommonDependency'] },
        },
      ],
    });
    return dishes.map((dish) => dish.toJSON());
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
});

ipcMain.handle('addDish', async (event, dishData) => {
  try {
    const { nome, prezzo, categoria, descrizione, hasCommonDependency, ingredients } = dishData;
    const dish = await Dish.create({ nome, prezzo, categoria, descrizione, hasCommonDependency });

    for (const ingredient of ingredients) {
      await DishMenuItem.create({
        DishId: dish.id,
        MenuItemId: ingredient.itemId,
        quantita: ingredient.quantity,
        isCommonDependency: hasCommonDependency,
      });
    }

    return { success: true, dish: dish.toJSON() };
  } catch (error) {
    console.error('Error adding dish:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggleDishAvailability', async (event, dishId) => {
  try {
    const dish = await Dish.findByPk(dishId);
    if (dish) {
      dish.disponibile = !dish.disponibile;
      await dish.save();
      return { success: true };
    }
    return { success: false, error: 'Dish not found' };
  } catch (error) {
    console.error('Error toggling dish availability:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('getDish', async (event, dishId) => {
  try {
    const dish = await Dish.findByPk(dishId, {
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          through: { attributes: ['quantita'] },
        },
      ],
    });
    return dish ? dish.toJSON() : null;
  } catch (error) {
    console.error('Error fetching dish:', error);
    return null;
  }
});

ipcMain.handle('updateDish', async (event, dishData) => {
  return sequelize.enqueue(async () => {
    const t = await sequelize.transaction();
    try {
      const { id, nome, prezzo, categoria, descrizione, hasCommonDependency, ingredients } =
        dishData;
      const dish = await Dish.findByPk(id, { transaction: t });
      if (!dish) {
        throw new Error('Dish not found');
      }

      await dish.update(
        { nome, prezzo, categoria, descrizione, hasCommonDependency },
        { transaction: t }
      );

      // Remove existing ingredients
      await DishMenuItem.destroy({
        where: { DishId: id },
        transaction: t,
      });

      // Add new ingredients, ensuring uniqueness
      const uniqueIngredients = ingredients.reduce((acc, ingredient) => {
        const key = `${ingredient.itemId}`;
        if (!acc[key] || ingredient.quantity > acc[key].quantity) {
          acc[key] = ingredient;
        }
        return acc;
      }, {});

      await DishMenuItem.bulkCreate(
        Object.values(uniqueIngredients).map((ingredient) => ({
          DishId: id,
          MenuItemId: ingredient.itemId,
          quantita: ingredient.quantity,
          isCommonDependency: hasCommonDependency,
        })),
        { transaction: t }
      );

      await t.commit();
      return { success: true, dish: dish.toJSON() };
    } catch (error) {
      await t.rollback();
      console.error('Error updating dish:', error);
      return { success: false, error: error.message };
    }
  });
});

ipcMain.handle('checkDishAvailability', async (event, dishId) => {
  try {
    const dish = await Dish.findByPk(dishId, {
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          through: { attributes: ['quantita', 'isCommonDependency'] },
        },
      ],
    });

    if (!dish) {
      throw new Error('Dish not found');
    }

    let maxQuantity = Infinity;
    let limitingFactor = null;

    for (const menuItem of dish.menuItems) {
      const availableQuantity = Math.floor(menuItem.quantita / menuItem.DishMenuItem.quantita);
      if (availableQuantity < maxQuantity) {
        maxQuantity = availableQuantity;
        limitingFactor = menuItem.nome;
      }
    }

    if (dish.hasCommonDependency) {
      const commonDependency = await MenuItem.findOne({ where: { isCommonDependency: true } });
      if (commonDependency) {
        const commonAvailableQuantity = commonDependency.quantita;
        if (commonAvailableQuantity < maxQuantity) {
          maxQuantity = commonAvailableQuantity;
          limitingFactor = commonDependency.nome;
        }
      }
    }

    if (maxQuantity > 0) {
      return { available: true, maxQuantity };
    } else {
      return { available: false, reason: `Ingrediente esaurito: ${limitingFactor}` };
    }
  } catch (error) {
    console.error('Error checking dish availability:', error);
    return { available: false, reason: 'Errore durante il controllo della disponibilità' };
  }
});

ipcMain.handle('getMenuItems', async () => {
  try {
    const menuItems = await MenuItem.findAll();
    return menuItems.map((item) => item.toJSON());
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
});

ipcMain.handle('getMenuItem', async (event, itemId) => {
  try {
    const item = await MenuItem.findByPk(itemId);
    return item ? item.toJSON() : null;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return null;
  }
});

ipcMain.handle('updateMenuItem', async (event, itemData) => {
  try {
    const { id, nome, prezzo, quantita, categoria } = itemData;
    const item = await MenuItem.findByPk(id);
    if (!item) {
      throw new Error('Menu item not found');
    }

    await item.update({ nome, prezzo, quantita, categoria });
    return { success: true, item: item.toJSON() };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('updateMenuItemQuantity', async (event, { id, quantita }) => {
  try {
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid item ID');
    }
    const item = await MenuItem.findByPk(id);
    if (!item) {
      throw new Error('Menu item not found');
    }

    await item.update({ quantita });
    return { success: true, item: item.toJSON() };
  } catch (error) {
    console.error('Error updating menu item quantity:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logout', async () => {
  currentUser = null;
  mainWindow.loadFile('index.html');
  return { success: true };
});

ipcMain.handle('deleteDish', async (event, dishId) => {
  try {
    await Dish.destroy({ where: { id: dishId } });
    return { success: true };
  } catch (error) {
    console.error('Error deleting dish:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('deleteMenuItem', async (event, itemId) => {
  try {
    await MenuItem.destroy({ where: { id: itemId } });
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('submitOrder', async (event, orderData) => {
  const t = await sequelize.transaction();
  try {
    if (!orderData.total || isNaN(orderData.total) || orderData.total <= 0) {
      throw new Error('Invalid order total');
    }

    // Recalculate total on the server side to ensure accuracy
    const calculatedTotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (Math.abs(calculatedTotal - orderData.total) > 0.01) {
      // Allow for small floating point discrepancies
      throw new Error('Order total mismatch');
    }

    await updateInventoryForOrder(orderData.items, t);

    const order = await Order.create(
      {
        total: calculatedTotal,
        status: 'pending',
        date: new Date(),
      },
      { transaction: t }
    );

    for (const item of orderData.items) {
      await OrderItem.create(
        {
          OrderId: order.id,
          MenuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return { success: true, orderId: order.id };
  } catch (error) {
    await t.rollback();
    console.error('Error submitting order:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('getOrders', async () => {
  try {
    const orders = await Order.findAll({
      order: [['date', 'DESC']],
    });
    return orders.map((order) => order.toJSON());
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
});

ipcMain.handle('getOrderDetails', async (event, orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items', // Make sure this matches the association alias
          include: [MenuItem],
        },
      ],
    });
    return order ? order.toJSON() : null;
  } catch (error) {
    console.error('Error getting order details:', error);
    throw error;
  }
});

ipcMain.handle('updateOrderStatus', async (event, { orderId, status }) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    await order.update({ status });
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('getDishes', async () => {
  try {
    const dishes = await Dish.findAll({
      attributes: ['id', 'nome', 'prezzo', 'disponibile'],
    });
    return dishes.map((dish) => dish.toJSON());
  } catch (error) {
    console.error('Error fetching dishes:', error);
    throw error;
  }
});

async function updateInventoryForOrder(orderItems, t) {
  for (const item of orderItems) {
    const dish = await Dish.findByPk(item.id, { transaction: t });
    if (!dish) {
      throw new Error(`Dish with id ${item.id} not found`);
    }

    const dishMenuItems = await DishMenuItem.findAll({
      where: { DishId: dish.id },
      transaction: t,
    });

    for (const dishMenuItem of dishMenuItems) {
      const menuItem = await MenuItem.findByPk(dishMenuItem.MenuItemId, { transaction: t });
      if (!menuItem) {
        throw new Error(`MenuItem with id ${dishMenuItem.MenuItemId} not found`);
      }

      const quantityToReduce = dishMenuItem.quantita * item.quantity;
      if (menuItem.quantita < quantityToReduce) {
        throw new Error(`Insufficient inventory for ${menuItem.nome}`);
      }

      menuItem.quantita -= quantityToReduce;
      await menuItem.save({ transaction: t });
    }
  }
}

async function checkInventoryForOrder(orderItems) {
  for (const item of orderItems) {
    const dish = await Dish.findByPk(item.id);
    if (!dish) {
      throw new Error(`Dish with id ${item.id} not found`);
    }

    const dishMenuItems = await DishMenuItem.findAll({
      where: { DishId: dish.id },
      include: [MenuItem],
    });

    for (const dishMenuItem of dishMenuItems) {
      const quantityNeeded = dishMenuItem.quantita * item.quantity;
      if (dishMenuItem.MenuItem.quantita < quantityNeeded) {
        throw new Error(`Insufficient inventory for ${dishMenuItem.MenuItem.nome}`);
      }
    }
  }
}

ipcMain.handle('checkInventoryForOrder', async (event, orderItems) => {
  try {
    await checkInventoryForOrder(orderItems);
    return { success: true };
  } catch (error) {
    console.error('Inventory check failed:', error);
    return { success: false, error: error.message };
  }
});

// Sync-related functions
async function startSync() {
  console.log('Starting sync as master.');
  // Implement master sync logic here
}

async function stopSync() {
  console.log('Stopping sync, no longer master.');
  // Implement logic to stop sync here
}

async function syncWith(node) {
  console.log('Syncing with node:', node.address);
  const lastSync = await getLastSyncTime(node.address);
  const changes = await getChanges(lastSync);
  node.send('sync-request', changes);
}

async function getLastSyncTime(nodeAddress) {
  const syncLog = await SyncLog.findOne({ where: { node_address: nodeAddress } });
  return syncLog ? syncLog.last_sync : new Date(0); // Return Unix epoch if no sync log found
}

async function getChanges(since) {
  const changes = {
    dishes: await Dish.findAll({ where: { updated_at: { [sequelize.Op.gt]: since } } }),
    menuItems: await MenuItem.findAll({ where: { updated_at: { [sequelize.Op.gt]: since } } }),
    orders: await Order.findAll({ where: { updated_at: { [sequelize.Op.gt]: since } } }),
    orderItems: await OrderItem.findAll({ where: { updated_at: { [sequelize.Op.gt]: since } } }),
  };
  return changes;
}

async function applyChanges(changes) {
  const t = await sequelize.transaction();

  try {
    for (const [model, items] of Object.entries(changes)) {
      switch (model) {
        case 'dishes':
          await Dish.bulkCreate(items, {
            updateOnDuplicate: [
              'nome',
              'prezzo',
              'categoria',
              'disponibile',
              'descrizione',
              'hasCommonDependency',
              'updated_at',
            ],
            transaction: t,
          });
          break;
        case 'menuItems':
          await MenuItem.bulkCreate(items, {
            updateOnDuplicate: ['nome', 'prezzo', 'quantita', 'categoria', 'updated_at'],
            transaction: t,
          });
          break;
        case 'orders':
          await Order.bulkCreate(items, {
            updateOnDuplicate: ['status', 'total', 'date', 'updated_at'],
            transaction: t,
          });
          break;
        case 'orderItems':
          await OrderItem.bulkCreate(items, {
            updateOnDuplicate: ['quantity', 'price', 'updated_at'],
            transaction: t,
          });
          break;
      }
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error('Error applying changes:', error);
    throw error;
  }
}

ipcMain.on('sync-request', async (event, changes) => {
  try {
    await applyChanges(changes);
    event.reply('sync-response', { success: true });
  } catch (error) {
    console.error('Error applying changes:', error);
    event.reply('sync-response', { success: false, error: error.message });
  }
});

ipcMain.handle('manualSync', async () => {
  try {
    const nodes = discover.getPeers();
    for (const node of nodes) {
      await syncWith(node);
    }
    return { success: true };
  } catch (error) {
    console.error('Error during manual sync:', error);
    return { success: false, error: error.message };
  }
});
