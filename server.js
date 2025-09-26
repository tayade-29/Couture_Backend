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
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected to Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

//     const allowedOrigins = [
//     "http://localhost:5173",
//     "https://your-frontend-domain.com"
// ];

// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));


// Middleware

// Middleware
app.use(cors({
    origin: "*",   // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
