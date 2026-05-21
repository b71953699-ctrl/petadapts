const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'pet_adoption',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection helper
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected to Aiven');
    connection.release();
  })
  .catch(err => {
    console.warn('⚠️ MySQL Connection Failed:', err.message);
  });

module.exports = pool;