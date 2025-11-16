/**
 * Inventory Management System with Authentication
 * Backend Server with JWT Authentication
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`🗄️  Database: inventory_db`);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// ============ SCHEMAS ============

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Item Schema (updated with user reference)
const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Clothing', 'Food', 'Furniture', 'Tools', 'Other'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Item = mongoose.model('Item', itemSchema);

// ============ MIDDLEWARE ============

// Verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ============ AUTH ROUTES ============

/**
 * POST /api/auth/signup
 * Register new user
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        required: ['username', 'email', 'password']
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ============ ITEM ROUTES (Protected) ============

/**
 * POST /api/items
 * Create new item (requires authentication)
 */
app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const { itemName, quantity, price, description, category } = req.body;

    if (!itemName || quantity === undefined || price === undefined || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['itemName', 'quantity', 'price', 'category']
      });
    }

    const newItem = new Item({
      itemName,
      quantity,
      price,
      description,
      category,
      userId: req.user.userId,
    });

    await newItem.save();
    res.status(201).json({ 
      message: 'Item created successfully', 
      item: newItem 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * GET /api/items
 * Get all items for current user
 */
app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { userId: req.user.userId };
    if (category) filter.category = category;
    
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ 
      count: items.length,
      items 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * GET /api/items/:id
 * Get single item
 */
app.get('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }

    const item = await Item.findOne({ _id: id, userId: req.user.userId });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * PUT /api/items/:id
 * Update item
 */
app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, quantity, price, description, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { 
        itemName, 
        quantity, 
        price, 
        description, 
        category,
        updatedAt: Date.now()
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ 
      message: 'Item updated successfully', 
      item: updatedItem 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * DELETE /api/items/:id
 * Delete item
 */
app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }

    const deletedItem = await Item.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ 
      message: 'Item deleted successfully',
      item: deletedItem
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * GET /api/stats
 * Get user's inventory statistics
 */
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.userId });
    
    const stats = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      categoryBreakdown: {}
    };
    
    items.forEach(item => {
      if (!stats.categoryBreakdown[item.category]) {
        stats.categoryBreakdown[item.category] = {
          count: 0,
          quantity: 0,
          value: 0
        };
      }
      stats.categoryBreakdown[item.category].count++;
      stats.categoryBreakdown[item.category].quantity += item.quantity;
      stats.categoryBreakdown[item.category].value += item.price * item.quantity;
    });
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Inventory Management System - Backend Server');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50) + '\n');
});