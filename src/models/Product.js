const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], default: [] },
  color: { type: String },
  storePrice: { type: Number, required: true },
  dhlPrice: { type: Number, required: true },
  shipPrice: { type: Number, required: true },
  size: { type: String },
  weight: { type: String },
  performance: { type: String },
  otherDimensions: { type: [String], default: [] },
  composition: { type: String },
  category: { type: String },
  brand: { type: String },
  productCode: { type: String, required: true, unique: true },
  isPublished: { type: Boolean, required: true, default: false },
  keywords: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
