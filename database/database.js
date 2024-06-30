const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'cash_manager.sqlite'),
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    timeout: 60000, // 60 seconds
  },
  retry: {
    match: [/SQLITE_BUSY/, /SQLITE_LOCKED/, /SQLITE_IOERR_LOCK/, /SQLITE_IOERR_BUSY/],
    name: 'query',
    max: 5,
  },
});

// Add a custom method to the Sequelize instance for retrying operations
sequelize.retryOperation = async function (operation, maxRetries = 5, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const queue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const { operation, resolve, reject } = queue.shift();
    try {
      const result = await operation();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }

  isProcessing = false;
}

sequelize.enqueue = function (operation) {
  return new Promise((resolve, reject) => {
    queue.push({ operation, resolve, reject });
    processQueue();
  });
};

module.exports = sequelize;
