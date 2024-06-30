const { app, BrowserWindow, ipcMain } = require('electron');
const sequelize = require('./database/database');
const { authenticateUser } = require('./auth/auth');
const { Dish, MenuItem, checkAssociations } = require('./models');

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

ipcMain.handle('logout', () => {
  currentUser = null;
  mainWindow.loadFile('index.html');
});

ipcMain.handle('getInventory', async () => {
  try {
    const items = await MenuItem.findAll({
      attributes: ['nome', 'prezzo', 'quantita', 'categoria'],
    });
    console.log(
      'Fetched items:',
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

ipcMain.handle('updateMenuItemQuantity', async (event, { nome, quantita }) => {
  try {
    const item = await MenuItem.findOne({ where: { nome } });
    if (item) {
      item.quantita = quantita;
      await item.save();
      return { success: true };
    } else {
      return { success: false, error: 'Item not found' };
    }
  } catch (error) {
    console.error('Error updating menu item quantity:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('getMenu', async () => {
  try {
    await checkAssociations(); // Check associations before querying
    const dishes = await Dish.findAll({
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          through: { attributes: ['quantita'] },
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
    const dish = await Dish.create(dishData);
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
