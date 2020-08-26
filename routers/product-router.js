const express = require('express');

const authorization = require('../middleware/authorization');
const fileUpload = require('../middleware/file-upload');
const {
  createProduct,
  deleteProduct,
  editProduct,
  fetchProduct,
  fetchProducts
} = require('../controllers/product-controller');

const router = new express.Router();

router.delete('/:productId', authorization, deleteProduct);

router.get('/:productId', fetchProduct);

router.get('/', fetchProducts);

router.patch('/:productId', authorization, fileUpload.single('image'), editProduct);

router.post('/', authorization, fileUpload.single('image'), createProduct);

module.exports = router;