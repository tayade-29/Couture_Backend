const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/Product');
const shopRoutes = require('./routes/shop');

const PORT = 3000;

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CoutureCollection')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // frontend URL (adjust if needed)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data

// Routes
app.use('/api/auth', authRoutes);      // /api/auth/register, /api/auth/login
app.use('/api/admin', adminRoutes);    // /api/admin/products
app.use('/api/products', productRoutes); // /api/products
app.use('/api/shop', shopRoutes);      // /api/shop

// Test root
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
