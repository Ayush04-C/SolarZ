const express = require('express');
const router = express.Router();
const { getUsers, getProducts, toggleProductActive, getOrders } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/products', getProducts);
router.put('/products/:id/moderate', toggleProductActive);
router.get('/orders', getOrders);

module.exports = router;
