const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Fuse = require('fuse.js');

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, city, district } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      seller: req.user._id,
      stock,
      location: { city, district },
      images
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, city, minRating, page = 1, limit = 9 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const numLimit = Number(limit);

    const pipeline = [];

    const matchStage = { isActive: true };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      matchStage.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }
    if (category) matchStage.category = new mongoose.Types.ObjectId(category);
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }
    if (city) matchStage['location.city'] = city;
    if (minRating) matchStage.rating = { $gte: Number(minRating) };

    pipeline.push({ $match: matchStage });

    pipeline.push({
      $facet: {
        products: [
          { $skip: skip },
          { $limit: numLimit },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          { $lookup: { from: 'users', localField: 'seller', foreignField: '_id', as: 'seller' } },
          { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
          { $project: { 'seller.password': 0, 'seller.email': 0 } }
        ],
        totalCount: [
          { $count: 'count' }
        ],
        filters: [
          {
            $group: {
              _id: null,
              categories: { $addToSet: '$category' },
              cities: { $addToSet: '$location.city' },
              minAvailablePrice: { $min: '$price' },
              maxAvailablePrice: { $max: '$price' }
            }
          }
        ]
      }
    });

    const result = await Product.aggregate(pipeline);
    const data = result[0];

    const total = data.totalCount.length > 0 ? data.totalCount[0].count : 0;
    const availableFilters = data.filters.length > 0 ? data.filters[0] : { categories: [], cities: [], minAvailablePrice: 0, maxAvailablePrice: 0 };
    if (availableFilters._id === null) delete availableFilters._id;

    res.json({
      products: data.products,
      page: Number(page),
      pages: Math.ceil(total / numLimit),
      total,
      availableFilters
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name');

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const reviews = await Review.find({ product: product._id }).populate('user', 'name');

    res.json({ product, reviews });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check ownership or admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this product');
    }

    // Update fields
    const { name, description, price, category, stock, city, district } = req.body;
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (city) product.location.city = city;
    if (district) product.location.district = district;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this product');
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id, isActive: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getSearchSuggestions = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) return res.json([]);

    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('seller', 'name location');

    const options = {
      keys: ['name', 'description', 'category.name'],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true
    };

    const fuse = new Fuse(products, options);
    const results = fuse.search(search).map(result => result.item);

    res.json(results.slice(0, 5));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getSearchSuggestions
};
