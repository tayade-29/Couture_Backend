const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User'); 
const auth = require("../middleware/auth");
const Product = require('../models/Product');
const upload = require("../middleware/cloudinary");
require('dotenv').config();

router.post("/products", auth, upload.single("image"), async (req, res) => {
    try {
        const { title, description, price, quantity } = req.body;

        if (!title || quantity == null || price == null || !description || !req.file) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!req.user.isAdmin) return res.status(403).send("Access denied");

        const product = new Product({
            title,
            description,
            price,
            quantity,
            imageUrl: req.file.path 
        });

        await product.save();
        res.status(201).json({
    message: "Product created successfully",
    productId: product._id,
    product
});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;