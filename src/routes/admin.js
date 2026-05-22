const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin role
router.use(auth, authorize('admin'));

// Manage Users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT userId, username, email, role, createdAt FROM users ORDER BY createdAt DESC');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'shelter_staff', 'adopter'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, password } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('UPDATE users SET email = ?, role = ?, password = ? WHERE userId = ?',
        [email, role, hashedPassword, id]);
    } else {
      await db.query('UPDATE users SET email = ?, role = ? WHERE userId = ?',
        [email, role, id]);
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await db.query('DELETE FROM users WHERE userId = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage Pets (view all)
router.get('/pets', async (req, res) => {
  try {
    const [pets] = await db.query(`
      SELECT p.*, u.username as addedByUsername
      FROM pets p
      LEFT JOIN users u ON p.addedBy = u.userId
      ORDER BY p.createdAt DESC
    `);
    res.json({ pets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View Reports
router.get('/reports', async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    const [totalPets] = await db.query('SELECT COUNT(*) as count FROM pets');
    const [availablePets] = await db.query("SELECT COUNT(*) as count FROM pets WHERE status = 'available'");
    const [totalAdoptions] = await db.query("SELECT COUNT(*) as count FROM adoption_requests WHERE status = 'approved'");
    const [pendingRequests] = await db.query("SELECT COUNT(*) as count FROM adoption_requests WHERE status = 'pending'");

    res.json({
      totalUsers: totalUsers[0].count,
      totalPets: totalPets[0].count,
      availablePets: availablePets[0].count,
      totalAdoptions: totalAdoptions[0].count,
      pendingRequests: pendingRequests[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;