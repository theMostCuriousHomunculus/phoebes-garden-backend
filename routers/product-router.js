const express = require('express');

const authorization = require('../middleware/authorization');
const {
  createProduct,
  deleteProduct,
  editProduct,
  fetchProduct,
  fetchProducts
} = require('../controllers/product-controller');

const router = new express.Router();

router.delete('/', authorization, deleteProduct);

router.get('/:productId', fetchProduct);

router.get('/', fetchProducts);

router.patch('/', authorization, editProduct);

router.post('/', authorization, createProduct);

module.exports = router;