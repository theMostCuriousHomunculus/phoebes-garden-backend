const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);

const Order = require('../models/order-model');
const Product = require('../models/product-model');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}));

async function createOrder (req, res, next) {

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const items = [];
      let item = {
        price: undefined,
        product_id: undefined,
        product_name: undefined,
        quantity: undefined
      };

      const ids = paymentIntent.metadata.item_ids.split(',');
      const names = paymentIntent.metadata.item_names.split(',');
      const prices = paymentIntent.metadata.item_prices.split(',');
      const quantities = paymentIntent.metadata.item_quantities.split(',');
      let emailBody = '';

      for (let i = 0; i < ids.length - 1; i++) {
        item.price = parseInt(prices[i]) / 100;
        item.product_id = mongoose.Types.ObjectId(ids[i]);
        item.product_name = names[i];
        item.quantity = parseInt(quantities[i]);
        items.push({ ...item });
        emailBody += `<li>${item.product_name}: ${item.quantity}</li>`;
        await Product.findByIdAndUpdate(item.product_id, { $inc: { quantity: -item.quantity } });
      }

      const order = new Order({
        _id: paymentIntent.id,
        customer_contact: {
          city: paymentIntent.shipping ? paymentIntent.shipping.address.city : null,
          email_address: paymentIntent.receipt_email,
          phone_number: paymentIntent.shipping ? paymentIntent.shipping.phone : null,
          state: paymentIntent.shipping ? paymentIntent.shipping.address.state : null,
          street_address: paymentIntent.shipping ? paymentIntent.shipping.address.line1 : null,
          zip: paymentIntent.shipping ? paymentIntent.shipping.address.postal_code : null
        },
        customer_name: paymentIntent.shipping ? paymentIntent.shipping.name : null,
        items,
        total: paymentIntent.amount
      });

      transporter.sendMail({
        to: process.env.ADMIN_EMAIL,
        from: 'do-not-reply@phoebes-garden.us',
        subject: "New Order - Phoebe's Garden",
        html:
          `<h1>New Order For ${paymentIntent.shipping.name}</h1>
          <ul>
            ${emailBody}
          </ul>
          <h2>Total Paid Through Stripe: $${paymentIntent.amount / 100}</h2>`
      });
      await order.save();
    }
  
    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  }
  catch (err) {
    transporter.sendMail({
      to: process.env.ADMIN_EMAIL,
      from: 'do-not-reply@phoebes-garden.us',
      subject: "Order Failure",
      html: `<p>${err}</p>`
    });
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
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

    const amount = items.reduce(function (a, c) {
      return a + (c.price * c.quantity);
    }, 0) * 100;
    const item_ids = items.reduce(function (a, c) {
      return a + c._id + ',';
    }, '');
    const item_names = items.reduce(function (a, c){
      return a + c.name + ',';
    }, '');
    const item_prices = items.reduce(function (a, c){
      return a + (c.price * 100) + ',';
    }, '');
    const item_quantities = items.reduce(function (a, c) {
      return a + c.quantity + ',';
    }, '');

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        item_ids,
        item_names,
        item_prices,
        item_quantities
      }
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