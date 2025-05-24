import { Contact } from '../models/Contact.js';

export const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.phone) {
      filter.phone = { $regex: req.query.phone, $options: 'i' };
    }
    if (req.query.address) {
      filter.address = { $regex: req.query.address, $options: 'i' };
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      contacts,
      pagination: {
        currentPage: page,
        totalPages,
        totalContacts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;

    // Validation
    if (!name || !phone || !address) {
      return res.status(400).json({ 
        message: 'Name, phone, and address are required' 
      });
    }

    if (name.length < 2) {
      return res.status(400).json({ 
        message: 'Name must be at least 2 characters long' 
      });
    }

    if (!/^\+?[\d\s\-()]+$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Invalid phone number format' 
      });
    }

    const contact = new Contact({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes ? notes.trim() : ''
    });

    await contact.save();
    
    // Emit to all connected clients
    const io = req.app.get('io');
    io.emit('contactAdded', contact);
    
    res.status(201).json(contact);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Create contact error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const lockContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    if (contact.lockedBy && contact.lockedBy !== req.user.username) {
      const lockAge = Date.now() - new Date(contact.lockedAt).getTime();
      // Auto-unlock after 5 minutes
      if (lockAge < 5 * 60 * 1000) {
        return res.status(423).json({ 
          message: 'Contact is locked by another user',
          lockedBy: contact.lockedBy 
        });
      }
    }

    contact.lockedBy = req.user.username;
    contact.lockedAt = new Date();
    await contact.save();

    const io = req.app.get('io');
    io.emit('contactLocked', { 
      contactId: contact._id, 
      lockedBy: req.user.username 
    });

    res.json({ message: 'Contact locked successfully' });
  } catch (error) {
    console.error('Lock contact error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const unlockContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    contact.lockedBy = null;
    contact.lockedAt = null;
    await contact.save();

    const io = req.app.get('io');
    io.emit('contactUnlocked', { contactId: contact._id });

    res.json({ message: 'Contact unlocked successfully' });
  } catch (error) {
    console.error('Unlock contact error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    if (contact.lockedBy !== req.user.username) {
      return res.status(423).json({ 
        message: 'Contact must be locked by you to edit' 
      });
    }

    const { name, phone, address, notes } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ 
        message: 'Name, phone, and address are required' 
      });
    }

    contact.name = name.trim();
    contact.phone = phone.trim();
    contact.address = address.trim();
    contact.notes = notes ? notes.trim() : '';
    contact.lockedBy = null;
    contact.lockedAt = null;

    await contact.save();

    const io = req.app.get('io');
    io.emit('contactUpdated', contact);
    io.emit('contactUnlocked', { contactId: contact._id });

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    const io = req.app.get('io');
    io.emit('contactDeleted', { contactId: contact._id });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};