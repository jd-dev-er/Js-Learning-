const User = require('../models/user.model');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single user by ID (Admin only or self)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // Allow admin or user themself
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user (Admin can update any, user can update self)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only admin or self can update, but only admin can change role/status
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.status;
    }

    // Do not allow password update here
    delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete/disable user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Soft delete: set status to 'disabled'
    const user = await User.findByIdAndUpdate(id, { status: 'disabled' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User disabled', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};