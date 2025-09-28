const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");
require('dotenv').config();

router.post("/", auth, async (req, res) => {
    try {
        const { productId, quantity, message, deliveryAddress } = req.body;

        if (!productId || !quantity || !deliveryAddress) {
            return res.status(400).json({ error: "Product, quantity and delivery address are required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (quantity > product.quantity) {
            return res.status(400).json({ error: "Not enough stock" });
        }

        // create order
const order = await Order.create({
    userId: req.user._id,
    product: product._id, 
    quantity,
    message,
    deliveryAddress
});



        // update stock
        await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });

        // prepare email
        const mailText = `
New Order Placed - ${new Date().toLocaleString()}

User Details:
Name: ${req.user.name}
Email: ${req.user.email}
Phone: ${req.user.phoneNo || 'N/A'}
Address: ${req.user.city || ''}, ${req.user.state || ''}, ${req.user.country || ''} - ${req.user.zipcode || ''}

Order Details: 
Product: ${product.title}
Price: ₹${product.price}
Quantity: ${quantity}
Message: ${message || 'N/A'}
Delivery Address: ${deliveryAddress}    

Order ID: ${order._id}
Created At: ${order.createdAt}
        `;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });


        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `New Shop Request from ${req.user.name}`,
            text: mailText,
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: req.user.email,
            subject: `Order Confirmation - ${product.title}`,
            text: `Dear ${req.user.name},

Thank you for shopping with Couture!

We are delighted to confirm that we have received your order for:
- ${quantity} × ${product.title}
- Price: ₹${product.price}

Your order is now being processed, and you will receive an update once it is ready to be shipped.  
If you have any questions or special requests regarding this order, feel free to reply to this email—we are always happy to assist you.

Delivery Address:
${deliveryAddress}

We truly appreciate your trust in Couture and look forward to serving you again.

Warm regards,  
The Couture Team`
        });


        res.json({
            message: "Order placed & email sent",
            orderId: order._id,
            productTitle: product.title
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
