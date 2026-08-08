const express = require('express');
const router = express.Router();
const { getUsers, getProducts, toggleProductActive, getOrders } = require('../controllers/adminController');
const { getAdminInventoryOverview } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

const { getAdminAnalytics } = require('../controllers/analyticsController');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/products', getProducts);
router.put('/products/:id/moderate', toggleProductActive);
router.get('/orders', getOrders);
router.get('/analytics', getAdminAnalytics);

// Inventory routes
router.get('/inventory', getAdminInventoryOverview);

module.exports = router;
