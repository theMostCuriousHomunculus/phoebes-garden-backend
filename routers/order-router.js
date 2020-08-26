const express = require('express');

const authorization = require('../middleware/authorization');
const {
  createOrder,
  createPaymentIntent,
  deleteOrder,
  editOrder,
  fetchOrder,
  fetchOrders
} = require('../controllers/order-controller');

const router = new express.Router();

router.delete('/', authorization, deleteOrder);

router.get('/:orderId', authorization, fetchOrder);

router.get('/', authorization, fetchOrders);

router.patch('/', authorization, editOrder);

router.post('/create-payment-intent', createPaymentIntent);

router.post('/', createOrder);

module.exports = router;