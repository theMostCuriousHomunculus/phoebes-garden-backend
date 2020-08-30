const bodyParser = require('body-parser');
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

router.post('/create-order', bodyParser.raw({type: 'application/json'}), createOrder);

router.use(express.json());
router.use(express.urlencoded({
  extended: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}));

router.delete('/:orderId', authorization, deleteOrder);

router.get('/:orderId', authorization, fetchOrder);

router.get('/', authorization, fetchOrders);

router.patch('/:orderId', authorization, editOrder);

router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;