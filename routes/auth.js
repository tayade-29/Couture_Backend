const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

// Helper to fetch location
async function fetchIndiaLocation(pin) {
    try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
        const data = res.data;
        if (Array.isArray(data) && data[0].Status === 'Success' && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            return {
                city: po.District || '',
                state: po.State || '',
                country: po.Country || '',
            };
        }
    } catch (err) {
        console.log(`Error occured while processing ${err}`);
    }
    return null;
}

// Register
// Register
router.post('/register', async (req, res) => {
    try {
        const { name, phoneNo, email, zipcode, password } = req.body;
        let city = '', state = '', country = '';

        if (/^[0-9]{6}$/.test(zipcode)) {
            const loc = await fetchIndiaLocation(zipcode);
            if (loc) {
                city = loc.city;
                state = loc.state;
                country = loc.country;
            }
        }

        const cleanEmail = String(email).trim().toLowerCase();
        let userExist = await User.findOne({ email: cleanEmail }).exec();
        if (userExist) {
            return res.status(400).json({ message: "Email is already used" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const userCount = await User.countDocuments();
        const isAdmin = userCount === 0;

        const user = new User({
            name,
            phoneNo,
            email: cleanEmail,
            zipcode,
            city,
            state,
            country,
            password: hashed,
            isAdmin
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNo: user.phoneNo,
                city: user.city,
                state: user.state,
                country: user.country,
                zipcode: user.zipcode,
                isAdmin: user.isAdmin
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Error Try again" });
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = String(email).trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail }).exec();
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNo: user.phoneNo,
                city: user.city,
                state: user.state,
                country: user.country,
                zipcode: user.zipcode,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error Try again" });
    }
});

module.exports = router;
