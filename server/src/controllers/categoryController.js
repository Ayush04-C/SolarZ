const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
    }
    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory };
