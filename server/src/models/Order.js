const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['mock_paid', 'pending'], default: 'pending' }
}, { timestamps: true });

// Index on createdAt to significantly speed up date-range aggregation queries
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
