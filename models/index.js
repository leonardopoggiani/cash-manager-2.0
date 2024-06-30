const sequelize = require('../database/database');
const Dish = require('./Dish');
const MenuItem = require('./MenuItem');
const DishMenuItem = require('./DishMenuItem');

Dish.belongsToMany(MenuItem, {
  through: DishMenuItem,
  as: 'menuItems',
  foreignKey: 'DishId',
  otherKey: 'MenuItemId',
});
MenuItem.belongsToMany(Dish, {
  through: DishMenuItem,
  as: 'dishes',
  foreignKey: 'MenuItemId',
  otherKey: 'DishId',
});

// Function to check associations
async function checkAssociations() {
  console.log('Checking Dish associations:', Object.keys(Dish.associations));
  console.log('Checking MenuItem associations:', Object.keys(MenuItem.associations));

  const dishAssoc = Dish.associations.menuItems;
  const menuItemAssoc = MenuItem.associations.dishes;

  console.log('Dish to MenuItem association:', dishAssoc ? 'exists' : 'missing');
  console.log('MenuItem to Dish association:', menuItemAssoc ? 'exists' : 'missing');
}

// Sync models with the database
async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    // Check if the table exists before creating the index
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='DishMenuItems'"
    );
    if (results.length > 0) {
      // Add the unique constraint after syncing and confirming the table exists
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS dish_menu_items_unique 
        ON DishMenuItems (DishId, MenuItemId)
      `);
      console.log('Unique constraint added successfully');
    } else {
      console.log('DishMenuItems table does not exist, skipping index creation');
    }
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

module.exports = {
  sequelize,
  Dish,
  MenuItem,
  DishMenuItem,
  syncModels,
  checkAssociations,
};
