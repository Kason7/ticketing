const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { stripe } = require('../stripe');

// IMPORT COMMONS
const Import = require('@kason7-ticketing/common');
const isAuthenticated = Import('middlewares', 'isAuthenticated');
const isValid = Import('middlewares', 'isValid');
const { NotFoundError, NotAuthorizedError, BadRequestError } = Import('errors');
const { OrderStatus } = Import('events', 'orderStatus');

// IMPORT MODELS
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// IMPORT EVENTS
const {
  PaymentCreatedPublisher,
} = require('../events/paymentCreatedPublisher');
const { NatsWrapper } = require('../natsWrapper');

router.post(
  '/api/payments',
  isAuthenticated,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  isValid,
  async (req, res) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    // Check if order exist
    if (!order) {
      throw new NotFoundError();
    }

    // Check if order belongs to user
    if (order.userId !== req.currentUser.id) {
      throw new NotAuthorizedError();
    }

    // Check if order is cancelled
    if (order.status === OrderStatus.ORDER_CANCELLED) {
      throw new BadRequestError('Cannot pay for an expired order');
    }

    // Create Stripe charge
    const charge = await stripe.charges.create(
      {
        currency: 'usd',
        amount: order.price * 100,
        source: token,
        description: 'Ticketing platform',
        metadata: { order_id: order.id },
      },
      {
        apiKey: process.env.STRIPE_KEY,
      }
    );

    // Save stripe charge to local database as payment doc
    const payment = new Payment({
      orderId: order.id,
      stripeId: charge.id,
    });
    await payment.save();

    // Emit events
    new PaymentCreatedPublisher(NatsWrapper.client()).publish({
      id: payment.id,
      orderId: payment.orderId,
    });

    // Send back response
    res.status(201).send({ id: payment.id });
  }
);

module.exports = router;
