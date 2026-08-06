const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const checkout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    if (user.cart.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      res.status(400);
      throw new Error('Shipping address is required');
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of user.cart) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Product ${product ? product.name : item.product} is out of stock`);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });

      totalAmount += product.price * item.quantity;
      
      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: 'mock_paid'
    });

    // Clear cart
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name images');
    
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.buyer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'seller') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { checkout, getMyOrders, getOrderById };
