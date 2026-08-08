const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['restock', 'adjustment', 'sale'], required: true },
  quantityChange: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
