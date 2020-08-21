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
    const product = await Product.findByIdAndUpdate(req.params.productId, changes, { new: true });
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
    const product = await Product.findById(req.params.productId).select('_id description image name price quantity');
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
  let productIdString = req.query._id;
  let productIdArray;
  let dbQuery = {};
  if (productIdString) {
    productIdArray = productIdString.split(',');
    console.log(productIdArray);
    delete req.query._id;
    dbQuery = { ...req.query, _id: { $in: productIdArray } }
  }
  try {
    const products = await Product.find(dbQuery).select('_id description image name price quantity');
    res.status(200).json(products);
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