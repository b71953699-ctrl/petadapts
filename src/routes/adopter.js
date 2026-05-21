const express = require('express');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require adopter role
router.use(auth, authorize('adopter', 'admin'));

router.get('/profile', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT userId, username, email, role, createdAt FROM users WHERE userId = ?',
      [req.user.userId]
    );
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { email } = req.body;
    await db.query('UPDATE users SET email = ? WHERE userId = ?', [email, req.user.userId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;