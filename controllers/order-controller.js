const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);

const Order = require('../models/order-model');
const Product = require('../models/product-model');

async function createOrder (req, res, next) {
  // if (req.body.type === 'payment_intent.succeeded') {
  //   const paymentIntent = req.body.data.object;
  //   console.log('PaymentIntent was successful!', paymentIntent);

  //   try {
  //     const order = new Order({
  //       customer_contact: {
  //         city: req.body.city,
  //         email_address: req.body.email_address,
  //         phone_number: req.body.phone_number,
  //         state: req.body.state,
  //         street_address: req.body.street_address,
  //         zip: req.body.zip
  //       },
  //       customer_name: {
  //         first: req.body.first_name,
  //         last: req.body.last_name
  //       },
  //       items,
  //       note: req.body.note,
  //       total
  //     });
    
  //     await order.save();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // Return a 200 response to acknowledge receipt of the event
  // res.json({ received: true });
  // try {
  //   const order = new Order({
  //     customer_contact: {
  //       city: req.body.city,
  //       email_address: req.body.email_address,
  //       phone_number: req.body.phone_number,
  //       state: req.body.state,
  //       street_address: req.body.street_address,
  //       zip: req.body.zip
  //     },
  //     customer_name: {
  //       first: req.body.first_name,
  //       last: req.body.last_name
  //     },
  //     items,
  //     note: req.body.note,
  //     total
  //   });
  
  //   await order.save();
    // res.status(201).json(order);
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
}

async function createPaymentIntent (req, res, next) {
  try {
    const productIds = req.body.items.map(function (item) {
      return item._id;
    });
    let items = await Product.find({ _id: { $in: productIds } }, { name: 1, price: 1 });
    items = items.map(function (item) {
      return { ...item._doc };
    });
    for (let item of items) {
      item.quantity = req.body.items.find(function (x) {
        return x._id === item._id.toString();
      }).quantity;
    }

    const total = items.reduce(function (a, c) {
      return a + (c.price * c.quantity);
    }, 0) * 100;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd"
    });

    res.send({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function deleteOrder (req, res, next) {
  try {
    const order = await Order.findByIdAndDelete(req.params.order_id);
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
    const order = await Order.findByIdAndUpdate(req.params.order_id, changes, { new: true });
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
  createPaymentIntent,
  deleteOrder,
  editOrder,
  fetchOrder,
  fetchOrders
}