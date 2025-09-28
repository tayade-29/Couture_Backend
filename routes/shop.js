const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require("../middleware/auth");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Must be in Render env variables

const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM, // Verified SendGrid sender email
      subject,
      text,
    };
    console.log("Sending email to:", to);
    await sgMail.send(msg);
    console.log("Email sent successfully to:", to);
  } catch (err) {
    console.error("SendGrid send error:", err.response ? err.response.body : err);
    throw err; // Re-throw so we see failure in backend
  }
};

router.post("/", auth, async (req, res) => {
  try {
    console.log("Incoming order request body:", req.body);

    const { productId, quantity, message, deliveryAddress } = req.body;

    if (!productId || !quantity || !deliveryAddress) {
      console.error("Missing required fields");
      return res.status(400).json({ error: "Product, quantity and delivery address are required" });
    }

    console.log("Fetching product:", productId);
    const product = await Product.findById(productId);
    console.log("Product found:", product);

    if (!product) {
      console.error("Product not found");
      return res.status(404).json({ error: "Product not found" });
    }

    if (quantity > product.quantity) {
      console.error("Not enough stock");
      return res.status(400).json({ error: "Not enough stock" });
    }

    console.log("Creating order...");
    const order = await Order.create({
      userId: req.user._id,
      product: product._id,
      quantity,
      message,
      deliveryAddress
    });
    console.log("Order created:", order);

    console.log("Updating stock...");
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

    console.log("Sending email to admin...");
    await sendEmail(process.env.EMAIL_TO, `New Shop Request from ${req.user.name}`, mailText);

    console.log("Sending confirmation email to user...");
    await sendEmail(req.user.email, `Order Confirmation - ${product.title}`, `
Dear ${req.user.name},

Thank you for shopping with Couture!

We are delighted to confirm that we have received your order for:
- ${quantity} × ${product.title}
- Price: ₹${product.price}

Your order is now being processed, and you will receive an update once it is ready to be shipped.  

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
    res.status(500).json({ error: err.message || "Server Error" });
  }
});

module.exports = router;
