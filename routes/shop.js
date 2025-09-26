const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth"); 
require('dotenv').config();

router.post("/", auth, async (req, res) => {
  try {
    const { product, quantity, message, deliveryAddress } = req.body;

    if (!product || !quantity || !deliveryAddress) {
      return res.status(400).send("Product, quantity and delivery address are required");
    }

   
    const order = await Order.create({
      userId: req.user._id,
      product,
      quantity,
      message,
      deliveryAddress
    });

    
    const mailText = `
New Order Placed - ${new Date().toLocaleString()}

User Details:
Name: ${req.user.name}
Email: ${req.user.email}
Phone: ${req.user.phoneNo || 'N/A'}
Address: ${req.user.city || ''}, ${req.user.state || ''}, ${req.user.country || ''} - ${req.user.zipcode || ''}

Order Details: 
  Product: ${product}
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
        to : req.user.email,
        subject: "Your Order is Received",
        text: `Dear ${req.user.name},\n\nThank you for your order! We have received your request for ${quantity} x ${product}. Our team will process your order and get back to you shortly.\n\nBest regards,\nCouture Team`
    });

    res.json({ message: "Order placed & email sent", orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
