const User = require('../models/User');
const Product = require('../models/Product');

const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name price images stock');
    res.json(user.cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    res.status(201).json(user.cart);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const item = user.cart.find(item => item.product.toString() === productId);
    if (!item) {
      res.status(404);
      throw new Error('Item not in cart');
    }

    item.quantity = Number(quantity);
    await user.save();
    res.json(user.cart);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    res.json(user.cart);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
