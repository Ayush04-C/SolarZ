const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const getSellerOrders = async (req, res, next) => {
  try {
    // Find all products owned by this seller
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    // Find orders that contain any of these products
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('items.product', 'name price seller')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    
    // Filter out items in the order that don't belong to this seller
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        item.product && item.product.seller && item.product.seller.toString() === req.user._id.toString()
      );
      return orderObj;
    }).filter(order => order.items.length > 0);

    res.json(filteredOrders);
  } catch (error) {
    next(error);
  }
};

const getSellerStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ seller: req.user._id, isActive: true });
    
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({ 'items.product': { $in: productIds } });
    
    let totalRevenue = 0;
    let totalOrders = orders.length;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(pid => pid.toString() === item.product.toString())) {
          totalRevenue += item.priceAtPurchase * item.quantity;
        }
      });
    });

    res.json({ totalProducts, totalOrders, totalRevenue });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSellerOrders, getSellerStats };
