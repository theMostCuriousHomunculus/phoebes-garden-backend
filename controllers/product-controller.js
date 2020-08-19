const Product = require('../models/product-model');

async function createProduct (req, res) {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteProduct (req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.body.product_id);
    if (!product) {
      next();
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function editProduct (req, res) {
  try {
    const changes = { ...req.body };
    delete changes.product_id;
    const product = await Product.findByIdAndUpdate(req.body.product_id, changes, { new: true });
    if (!product) {
      next();
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function fetchProduct (req, res) {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).send();
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function fetchProducts (req, res) {
  try {
    const products = await Product.find(req.query);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  editProduct,
  fetchProduct,
  fetchProducts
}