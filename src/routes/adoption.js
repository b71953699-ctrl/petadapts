const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Submit adoption request (adopter only)
router.post('/', auth, authorize('adopter', 'admin'), [
  body('petId').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { petId, notes } = req.body;

    // Check if pet exists and is available
    const [pets] = await db.query('SELECT * FROM pets WHERE petId = ?', [petId]);
    if (pets.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    if (pets[0].status !== 'available') {
      return res.status(400).json({ error: 'Pet is not available for adoption' });
    }

    // Check for existing pending request
    const [existing] = await db.query(
      "SELECT * FROM adoption_requests WHERE petId = ? AND adopterId = ? AND status = 'pending'",
      [petId, req.user.userId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You already have a pending request for this pet' });
    }

    const [result] = await db.query(
      'INSERT INTO adoption_requests (adopterId, petId, notes) VALUES (?, ?, ?)',
      [req.user.userId, petId, notes || null]
    );

    // Update pet status to pending
    await db.query("UPDATE pets SET status = 'pending' WHERE petId = ?", [petId]);

    res.status(201).json({
      message: 'Adoption request submitted successfully',
      requestId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View my adoption status (adopter)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT ar.*, p.name as petName, p.type as petType, p.breed as petBreed, p.imageUrl
      FROM adoption_requests ar
      JOIN pets p ON ar.petId = p.petId
      WHERE ar.adopterId = ?
      ORDER BY ar.requestDate DESC
    `, [req.user.userId]);

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel adoption request (if still pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await db.query(
      'SELECT * FROM adoption_requests WHERE requestId = ? AND adopterId = ?',
      [id, req.user.userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (requests[0].status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    await db.query('DELETE FROM adoption_requests WHERE requestId = ?', [id]);

    // Reset pet status if no other pending requests
    const [otherPending] = await db.query(
      'SELECT COUNT(*) as count FROM adoption_requests WHERE petId = ? AND status = "pending"',
      [requests[0].petId]
    );
    if (otherPending[0].count === 0) {
      await db.query("UPDATE pets SET status = 'available' WHERE petId = ?", [requests[0].petId]);
    }

    res.json({ message: 'Adoption request cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;