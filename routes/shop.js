const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require("../middleware/auth");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // From Render environment variables

const sendEmail = async (to, subject, text) => {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // Verified sender email in SendGrid
    subject,
    text,
  };
  await sgMail.send(msg);
};

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

    const order = await Order.create({
      userId: req.user._id,
      product: product._id,
      quantity,
      message,
      deliveryAddress
    });

    await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });

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

    await sendEmail(process.env.EMAIL_TO, `New Shop Request from ${req.user.name}`, mailText);

    await sendEmail(req.user.email, `Order Confirmation - ${product.title}`, `
Dear ${req.user.name},

Thank you for shopping with Couture!

We are delighted to confirm that we have received your order for:
- ${quantity} × ${product.title}
- Price: ₹${product.price}

Your order is now being processed.

Delivery Address:
${deliveryAddress}

Warm regards,  
The Couture Team
    `);

    res.json({
      message: "Order placed & email sent",
      orderId: order._id,
      productTitle: product.title
    });

  } catch (err) {
    console.error("Email/order error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
