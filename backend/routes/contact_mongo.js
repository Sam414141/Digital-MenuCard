const express = require('express');
const router = express.Router();
const { Contact } = require('../db_mongo');

/**
 * Submit Contact Form
 * POST /api/contact/submit
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Message should be at least 10 characters long'
      });
    }

    // Create contact document
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      subject: subject ? subject.trim() : undefined,
      message: message.trim()
    });

    await contact.save();

    res.status(201).json({
      status: 'success',
      message: 'Contact message submitted successfully',
      data: {
        contactId: contact._id,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit contact form'
    });
  }
});

/**
 * Get All Contacts (Admin only)
 * GET /api/contact/all
 */
router.get('/all', async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: contacts.map(contact => ({
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }))
    });

  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contacts'
    });
  }
});

/**
 * Get Contact by ID
 * GET /api/contact/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching contact:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contact'
    });
  }
});

module.exports = router;