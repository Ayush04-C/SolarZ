const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

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
    
    // Phase 1: Validate all products are in stock
    const productsToUpdate = [];
    
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
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // Phase 2: Decrement stock since all items are valid
    for (const update of productsToUpdate) {
      update.product.stock -= update.quantity;
      await update.product.save();
    }

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: 'mock_paid'
    });

    // Create inventory logs for the sale
    for (const update of productsToUpdate) {
      await InventoryLog.create({
        product: update.product._id,
        seller: update.product.seller,
        type: 'sale',
        quantityChange: -update.quantity,
        previousStock: update.product.stock + update.quantity,
        newStock: update.product.stock,
        note: `Sold via order ${order._id}`
      });
    }

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
