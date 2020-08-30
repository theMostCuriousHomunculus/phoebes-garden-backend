const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
  price: {
    required: true,
    type: Number
  },
  product_id: {
    ref: 'Product',
    required: true,
    type: Schema.Types.ObjectId
  },
  product_name: {
    required: true,
    type: String
  },
  quantity: {
    required: true,
    type: Number
  }
}, {
  _id: false
});

const orderSchema = new Schema({
  customer_contact: {
    city: String,
    email_address: {
      required: true,
      type: String
    },
    phone_number: String,
    state: String,
    street_address: String,
    zip: String
  },
  customer_name: {
    required: true,
    type: String
  },
  items: [itemSchema],
  total: {
    min: 0,
    required: true,
    type: Number
  }
}, {
  timestamps: true
});

const Order = model('Order', orderSchema);

module.exports = Order;