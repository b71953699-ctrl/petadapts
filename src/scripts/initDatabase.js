require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDatabase() {
  // First connect without database to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'pet_adoption'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'pet_adoption'}`);
    console.log('✅ Database created/selected');

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        userId INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role ENUM('admin', 'staff', 'adopter') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create Pets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pets (
        petId INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        breed VARCHAR(100),
        age INT,
        status ENUM('available', 'pending', 'adopted', 'unavailable') DEFAULT 'available',
        description TEXT,
        imageUrl VARCHAR(500),
        addedBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (addedBy) REFERENCES users(userId) ON DELETE SET NULL
      )
    `);
    console.log('✅ Pets table created');

    // Create Adoption Requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS adoption_requests (
        requestId INT AUTO_INCREMENT PRIMARY KEY,
        adopterId INT NOT NULL,
        petId INT NOT NULL,
        requestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        notes TEXT,
        processedBy INT,
        processedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (adopterId) REFERENCES users(userId) ON DELETE CASCADE,
        FOREIGN KEY (petId) REFERENCES pets(petId) ON DELETE CASCADE,
        FOREIGN KEY (processedBy) REFERENCES users(userId) ON DELETE SET NULL
      )
    `);
    console.log('✅ Adoption Requests table created');

    // Insert default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.query(`
      INSERT IGNORE INTO users (username, password, email, role)
      VALUES ('admin', ?, 'admin@petadoption.com', 'admin')
    `, [hashedPassword]);
    console.log('✅ Default admin user created (username: admin, password: admin123)');

    console.log('\n🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();