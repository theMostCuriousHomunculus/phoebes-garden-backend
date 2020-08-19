const Order = require('../models/order-model');
const Product = require('../models/product-model');

async function createOrder (req, res, next) {
  try {
    const productIds = req.body.items.map(function (item) {
      return item.product_id;
    });
    let items = await Product.find({ _id: { $in: productIds } }, { name: 1, price: 1 });
    items = items.map(function (item) {
      return { ...item._doc };
    });

    for (let item of items) {
      item.quantity = req.body.items.find(function (x) {
        return x.product_id === item._id.toString();
      }).quantity;
      item.product_id = item._id;
      delete item._id;
      item.product_name = item.name;
      delete item.name;
    }

    const total = items.reduce(function (a, c) {
      return a + (c.price * c.quantity);
    }, 0);

    const order = new Order({
      customer_contact: {
        city: req.body.city,
        email_address: req.body.email_address,
        phone_number: req.body.phone_number,
        state: req.body.state,
        street_address: req.body.street_address,
        zip: req.body.zip
      },
      customer_name: {
        first: req.body.first_name,
        last: req.body.last_name
      },
      items,
      note: req.body.note,
      total
    });
  
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteOrder (req, res, next) {
  try {
    const order = await Order.findByIdAndDelete(req.body.order_id);
    if (!order) {
      return next();
    } else {
      res.status(200).json(order);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function editOrder (req, res, next) {
  try {
    const changes = req.body;
    delete changes.order_id;
    const order = await Order.findByIdAndUpdate(req.body.order_id, changes, { new: true });
    if (!order) {
      next();
    } else {
      res.status(200).json(order);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function fetchOrder (req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      res.status(404).send();
    } else {
      res.status(200).json(order);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function fetchOrders (req, res, next) {
  try {
    const orders = await Order.find(req.query);
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createOrder,
  deleteOrder,
  editOrder,
  fetchOrder,
  fetchOrders
}