const express = require('express');
const router = express.Router();
const { getSellerOrders, getSellerStats } = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('seller'));

router.get('/orders', getSellerOrders);
router.get('/stats', getSellerStats);

module.exports = router;
