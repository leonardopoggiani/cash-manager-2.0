const sequelize = require('../database/database');
const Dish = require('./Dish');
const MenuItem = require('./MenuItem');
const DishMenuItem = require('./DishMenuItem');

// Define associations
Dish.belongsToMany(MenuItem, { through: DishMenuItem, as: 'menuItems' });
MenuItem.belongsToMany(Dish, { through: DishMenuItem, as: 'dishes' });

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
    await checkAssociations();
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncModels();

module.exports = {
  sequelize,
  Dish,
  MenuItem,
  DishMenuItem,
  checkAssociations,
};
