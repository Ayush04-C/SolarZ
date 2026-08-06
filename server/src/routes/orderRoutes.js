const express = require('express');
const router = express.Router();
const { checkout, getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/checkout', protect, checkout);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
