const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require staff role
router.use(auth, authorize('staff', 'admin'));

// Add Pet
router.post('/pets', [
  body('name').notEmpty().trim().escape(),
  body('type').notEmpty().trim().escape(),
  body('breed').optional().trim().escape(),
  body('age').isInt({ min: 0 }),
  body('description').optional().trim(),
  body('imageUrl').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, breed, age, description, imageUrl } = req.body;

    const [result] = await db.query(
      'INSERT INTO pets (name, type, breed, age, description, imageUrl, addedBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, breed || null, age, description || null, imageUrl || null, req.user.userId]
    );

    res.status(201).json({
      message: 'Pet added successfully',
      petId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Pet
router.put('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, breed, age, status, description, imageUrl } = req.body;

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (type) { updates.push('type = ?'); values.push(type); }
    if (breed !== undefined) { updates.push('breed = ?'); values.push(breed); }
    if (age !== undefined) { updates.push('age = ?'); values.push(age); }
    if (status) { updates.push('status = ?'); values.push(status); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (imageUrl !== undefined) { updates.push('imageUrl = ?'); values.push(imageUrl); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    await db.query(`UPDATE pets SET ${updates.join(', ')} WHERE petId = ?`, values);

    res.json({ message: 'Pet updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Pet
router.delete('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM pets WHERE petId = ?', [id]);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View Pending Adoption Requests
router.get('/adoption-requests', async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT ar.*, p.name as petName, p.type as petType, u.username as adopterName, u.email as adopterEmail
      FROM adoption_requests ar
      JOIN pets p ON ar.petId = p.petId
      JOIN users u ON ar.adopterId = u.userId
      ORDER BY ar.requestDate DESC
    `);
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Adoption Request
router.post('/adoption-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    await db.query(
      "UPDATE adoption_requests SET status = 'approved', processedBy = ?, processedAt = NOW(), notes = ? WHERE requestId = ?",
      [req.user.userId, notes || null, id]
    );

    // Get the petId from the request
    const [requests] = await db.query('SELECT petId FROM adoption_requests WHERE requestId = ?', [id]);
    if (requests.length > 0) {
      await db.query("UPDATE pets SET status = 'adopted' WHERE petId = ?", [requests[0].petId]);
      // Reject other pending requests for the same pet
      await db.query("UPDATE adoption_requests SET status = 'rejected' WHERE petId = ? AND requestId != ? AND status = 'pending'",
        [requests[0].petId, id]);
    }

    res.json({ message: 'Adoption request approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Adoption Request
router.post('/adoption-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    await db.query(
      "UPDATE adoption_requests SET status = 'rejected', processedBy = ?, processedAt = NOW(), notes = ? WHERE requestId = ?",
      [req.user.userId, notes || null, id]
    );

    res.json({ message: 'Adoption request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff's added pets
router.get('/my-pets', async (req, res) => {
  try {
    const [pets] = await db.query('SELECT * FROM pets WHERE addedBy = ? ORDER BY createdAt DESC', [req.user.userId]);
    res.json({ pets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;