const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getSearchSuggestions
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), upload.array('images', 5), createProduct);

router.get('/search-suggestions', getSearchSuggestions);

router.route('/mine')
  .get(protect, authorize('seller'), getMyProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('seller', 'admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
