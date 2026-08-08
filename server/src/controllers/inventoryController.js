const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// @desc    Update product stock (restock or adjustment)
// @route   PUT /api/seller/inventory/:productId/stock
// @access  Private/Seller
const updateStock = async (req, res, next) => {
  try {
    const { quantityChange, type, note } = req.body;
    
    if (quantityChange === undefined || !['restock', 'adjustment'].includes(type)) {
      res.status(400);
      throw new Error('Please provide a valid quantityChange and type (restock or adjustment)');
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update inventory for this product');
    }

    const previousStock = product.stock;
    const newStock = previousStock + Number(quantityChange);

    if (newStock < 0) {
      res.status(400);
      throw new Error('Stock cannot be negative');
    }

    product.stock = newStock;
    const updatedProduct = await product.save();

    const logEntry = await InventoryLog.create({
      product: product._id,
      seller: req.user._id,
      type,
      quantityChange,
      previousStock,
      newStock,
      note
    });

    res.json({ product: updatedProduct, log: logEntry });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's inventory overview
// @route   GET /api/seller/inventory
// @access  Private/Seller
const getSellerInventory = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    // Using aggregation or finding all and filtering in memory (since stockStatus is virtual)
    // To support virtuals in response cleanly, we find products and map them
    const products = await Product.find({ seller: req.user._id }).sort({ stock: 1 });
    
    let inventory = products.map(p => ({
      _id: p._id,
      name: p.name,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      stockStatus: p.stockStatus
    }));

    if (status) {
      inventory = inventory.filter(p => p.stockStatus === status);
    }

    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory history for a specific product
// @route   GET /api/seller/inventory/:productId/history
// @access  Private/Seller
const getProductStockHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view inventory history for this product');
    }

    const logs = await InventoryLog.find({ product: product._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
      
    const total = await InventoryLog.countDocuments({ product: product._id });

    res.json({
      logs,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin inventory overview
// @route   GET /api/admin/inventory
// @access  Private/Admin
const getAdminInventoryOverview = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const products = await Product.find().populate('seller', 'name email').sort({ stock: 1 });
    
    const overview = products.map(p => ({
      _id: p._id,
      name: p.name,
      seller: p.seller,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      stockStatus: p.stockStatus
    }));

    let filteredOverview = overview;
    if (status) {
      filteredOverview = overview.filter(p => p.stockStatus === status);
    }

    const summary = {
      totalProducts: overview.length,
      inStock: overview.filter(p => p.stockStatus === 'in_stock').length,
      lowStock: overview.filter(p => p.stockStatus === 'low_stock').length,
      outOfStock: overview.filter(p => p.stockStatus === 'out_of_stock').length
    };

    res.json({
      summary,
      products: filteredOverview
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateStock,
  getSellerInventory,
  getProductStockHistory,
  getAdminInventoryOverview
};
