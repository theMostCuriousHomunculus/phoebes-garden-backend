const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  description: {
    required: true,
    type: String
  },
  image: {
    required: true,
    type: String
  },
  name: {
    required: true,
    type: String
  },
  price: {
    min: 0,
    required: true,
    type: Number
  },
  quantity: {
    min: 0,
    required: true,
    type: Number
  }
}, {
  timestamps: true
});

const Product = model('Product', productSchema);

module.exports = Product;