const AWS = require('aws-sdk');

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const Product = require('../models/product-model');

async function createProduct (req, res) {
  try {
    const product = new Product({
      description: req.body.description,
      image: req.file.location,
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteProduct (req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      next();
    } else {
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: product.image.replace(`https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/`, '')
      }).promise();
      res.status(200).json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function editProduct (req, res) {
  try {
    const changes = {
      description: req.body.description,
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity
    };
    if (req.file) {
      const oldProduct = await Product.findById(req.params.productId);
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: oldProduct.image.replace(`https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/`, '')
      }).promise();
      changes.image = req.file.location;
    }
    const product = await Product.findByIdAndUpdate(req.params.productId, changes, { new: true });
    res.status(200).json(product);
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