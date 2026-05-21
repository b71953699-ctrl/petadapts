const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Public routes - Search pets (with filters)
router.get('/', async (req, res) => {
  try {
    const { type, breed, status, search, sortBy = 'createdAt', order = 'DESC' } = req.query;

    let query = `
      SELECT p.*, u.username as addedByUsername
      FROM pets p
      LEFT JOIN users u ON p.addedBy = u.userId
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND p.type = ?';
      params.push(type);
    }

    if (breed) {
      query += ' AND p.breed LIKE ?';
      params.push(`%${breed}%`);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    } else {
      query += " AND p.status = 'available'";
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const allowedSortFields = ['name', 'age', 'type', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${sortField} ${sortOrder}`;

    const [pets] = await db.query(query, params);
    res.json({ pets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [pets] = await db.query(`
      SELECT p.*, u.username as addedByUsername
      FROM pets p
      LEFT JOIN users u ON p.addedBy = u.userId
      WHERE p.petId = ?
    `, [id]);

    if (pets.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ pet: pets[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pet types for filtering
router.get('/meta/types', async (req, res) => {
  try {
    const [types] = await db.query('SELECT DISTINCT type FROM pets ORDER BY type');
    res.json({ types: types.map(t => t.type) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;