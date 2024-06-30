const sequelize = require('../database/database');
const Dish = require('./Dish');
const MenuItem = require('./MenuItem');
const DishMenuItem = require('./DishMenuItem');
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

// Existing associations
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

// New associations for Order and OrderItem
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'MenuItemId' });

// Function to check associations
async function checkAssociations() {
  console.log('Checking Dish associations:', Object.keys(Dish.associations));
  console.log('Checking MenuItem associations:', Object.keys(MenuItem.associations));
  console.log('Checking Order associations:', Object.keys(Order.associations));
  console.log('Checking OrderItem associations:', Object.keys(OrderItem.associations));

  const dishAssoc = Dish.associations.menuItems;
  const menuItemAssoc = MenuItem.associations.dishes;
  const orderAssoc = Order.associations.items;
  const orderItemAssoc = OrderItem.associations.Order;

  console.log('Dish to MenuItem association:', dishAssoc ? 'exists' : 'missing');
  console.log('MenuItem to Dish association:', menuItemAssoc ? 'exists' : 'missing');
  console.log('Order to OrderItem association:', orderAssoc ? 'exists' : 'missing');
  console.log('OrderItem to Order association:', orderItemAssoc ? 'exists' : 'missing');
}

// Sync models with the database
async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    // Check if the DishMenuItems table exists before creating the index
    const [dishMenuItemsResults] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='DishMenuItems'"
    );
    if (dishMenuItemsResults.length > 0) {
      // Add the unique constraint for DishMenuItems
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS dish_menu_items_unique
        ON DishMenuItems (DishId, MenuItemId)
      `);
      console.log('Unique constraint added successfully for DishMenuItems');
    } else {
      console.log('DishMenuItems table does not exist, skipping index creation');
    }

    // Check if the OrderItems table exists before creating the index
    const [orderItemsResults] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='OrderItems'"
    );
    if (orderItemsResults.length > 0) {
      // Add the unique constraint for OrderItems
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS order_items_unique
        ON OrderItems (OrderId, MenuItemId)
      `);
      console.log('Unique constraint added successfully for OrderItems');
    } else {
      console.log('OrderItems table does not exist, skipping index creation');
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
  Order,
  OrderItem,
  syncModels,
  checkAssociations,
};
