const bcrypt = require('bcrypt');
const User = require('../models/User');

const saltRounds = 10;

async function authenticateUser(username, password) {
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log('Utente non trovato:', username);
      return { success: false, message: 'Utente non trovato' };
    }

    console.log('Utente trovato:', user.username);
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);
    if (match) {
      return { success: true, user: { id: user.id, username: user.username, role: user.role } };
    } else {
      return { success: false, message: 'Password non corretta' };
    }
  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    return { success: false, message: 'Errore di autenticazione' };
  }
}

async function createUser(username, password, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ username, password: hashedPassword, role });
    return { success: true, user: { id: user.id, username: user.username, role: user.role } };
  } catch (error) {
    console.error("Errore durante la creazione dell'utente:", error);
    return { success: false, message: "Errore nella creazione dell'utente" };
  }
}

function checkPermission(user, requiredRole) {
  if (user.role === 'Admin') return true;
  return user.role === requiredRole;
}

module.exports = { authenticateUser, createUser, checkPermission };
