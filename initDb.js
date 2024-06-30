const { Dish, MenuItem, Order, OrderItem, syncModels } = require('./models');
const { createUser } = require('./auth/auth');

async function initDb() {
  try {
    await syncModels();
    console.log('Database sincronizzato e alterato con successo.');

    // Create users as before...
    const adminResult = await createUser('admin', 'password', 'Admin');
    if (adminResult.success) {
      console.log('Utente admin creato con successo.');
    } else {
      console.error("Errore nella creazione dell'utente admin:", adminResult.message);
    }

    const userResult = await createUser('operator', 'password', 'Operator');
    if (userResult.success) {
      console.log('Utente operator creato con successo.');
    } else {
      console.error("Errore nella creazione dell'utente operator:", userResult.message);
    }

    // Add some sample menu items
    const menuItems = await MenuItem.bulkCreate([
      { nome: 'Pizza Margherita', prezzo: 8.5, quantita: 50, categoria: 'Pizze' },
      { nome: 'Pasta al Pomodoro', prezzo: 7.0, quantita: 30, categoria: 'Primi' },
      { nome: 'Insalata Mista', prezzo: 5.0, quantita: 40, categoria: 'Contorni' },
      { nome: 'Fegatelli', prezzo: 6, quantita: 10, categoria: 'Secondi' },
      { nome: 'Pancetta', prezzo: 3, quantita: 20, categoria: 'Secondi' },
      { nome: 'Salsiccia', prezzo: 5, quantita: 10, categoria: 'Secondi' },
    ]);
    console.log('Menu items di esempio creati con successo.');

    // Add some sample dishes
    await Dish.bulkCreate([
      {
        nome: 'Pizza Margherita',
        prezzo: 8.5,
        categoria: 'Pizze',
        descrizione: 'Pomodoro, mozzarella, basilico',
      },
      {
        nome: 'Spaghetti alla Carbonara',
        prezzo: 10.0,
        categoria: 'Primi',
        descrizione: 'Uova, guanciale, pecorino, pepe nero',
      },
      {
        nome: 'Tiramisù',
        prezzo: 5.0,
        categoria: 'Dolci',
        descrizione: 'Savoiardi, mascarpone, caffè, cacao',
      },
    ]);
    console.log('Piatti di esempio creati con successo.');

    // Add some sample orders
    const orders = await Order.bulkCreate([
      {
        status: 'completed',
        total: 25.5,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        status: 'pending',
        total: 15.5,
        date: new Date(),
      },
      {
        status: 'cancelled',
        total: 18.0,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ]);

    // Add sample order items
    await OrderItem.bulkCreate([
      {
        OrderId: orders[0].id,
        MenuItemId: menuItems[0].id,
        quantity: 2,
        price: menuItems[0].prezzo,
      },
      {
        OrderId: orders[0].id,
        MenuItemId: menuItems[2].id,
        quantity: 1,
        price: menuItems[2].prezzo,
      },
      {
        OrderId: orders[1].id,
        MenuItemId: menuItems[1].id,
        quantity: 1,
        price: menuItems[1].prezzo,
      },
      {
        OrderId: orders[1].id,
        MenuItemId: menuItems[3].id,
        quantity: 1,
        price: menuItems[3].prezzo,
      },
      {
        OrderId: orders[2].id,
        MenuItemId: menuItems[4].id,
        quantity: 2,
        price: menuItems[4].prezzo,
      },
      {
        OrderId: orders[2].id,
        MenuItemId: menuItems[5].id,
        quantity: 1,
        price: menuItems[5].prezzo,
      },
    ]);

    console.log('Ordini e articoli di esempio creati con successo.');
  } catch (error) {
    console.error("Errore durante l'inizializzazione del database:", error);
  } finally {
    process.exit();
  }
}

initDb();
