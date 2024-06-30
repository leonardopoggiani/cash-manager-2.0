const { Dish, MenuItem, syncModels } = require('./models');
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
    await MenuItem.bulkCreate([
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
  } catch (error) {
    console.error("Errore durante l'inizializzazione del database:", error);
  } finally {
    process.exit();
  }
}

initDb();
