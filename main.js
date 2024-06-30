const { app, BrowserWindow, ipcMain } = require('electron');
const sequelize = require('./database/database');
const { authenticateUser } = require('./auth/auth');
const { Dish, MenuItem, DishMenuItem, checkAssociations, Order, OrderItem } = require('./models');

let mainWindow;
let currentUser = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
  try {
    await checkAssociations();
    await sequelize.authenticate();
    console.log('Connessione al database stabilita con successo.');
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

    const order = await Order.create(
      {
        total: calculatedTotal, // Use the recalculated total
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
    return [];
  }
});
