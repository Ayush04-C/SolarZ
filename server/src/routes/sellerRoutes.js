const express = require('express');
const router = express.Router();
const { getSellerOrders, getSellerStats } = require('../controllers/sellerController');
const { updateStock, getSellerInventory, getProductStockHistory } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('seller'));

router.get('/orders', getSellerOrders);
router.get('/stats', getSellerStats);

// Inventory routes
router.get('/inventory', getSellerInventory);
router.put('/inventory/:productId/stock', updateStock);
router.get('/inventory/:productId/history', getProductStockHistory);

module.exports = router;
