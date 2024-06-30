const sequelize = require('./database/database');
const { createUser } = require('./auth/auth');
const MenuItem = require('./models/MenuItem'); // Make sure this line is present

async function initDb() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database sincronizzato e alterato con successo.');

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
    ]);
    console.log('Menu items di esempio creati con successo.');
  } catch (error) {
    console.error("Errore durante l'inizializzazione del database:", error);
  } finally {
    process.exit();
  }
}

initDb();
