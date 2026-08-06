const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .populate('seller', 'name')
      .populate('category', 'name');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const toggleProductActive = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getProducts, toggleProductActive, getOrders };
