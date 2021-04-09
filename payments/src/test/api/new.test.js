const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const stripe = require('stripe')(process.env.STRIPE_KEY);

// IMPORT MODELS
const Order = require('../../models/Order');
const Payment = require('../../models/Payment');

// IMPORT TOOLS
const Import = require('@kason7-ticketing/common');
const { NatsWrapper } = require('../../natsWrapper');
const { OrderStatus } = Import('events', 'orderStatus');

// Route tests
it('Returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send({
      token: 'hjgynvgv',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  // Different user than the one trying to pay
  const differentUser = mongoose.Types.ObjectId().toHexString();

  // Create new order
  const order = new Order({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: differentUser,
    __v: 0,
    price: 20,
    status: OrderStatus.ORDER_CREATED,
  });
  await order.save();

  // Payment with different user than order user
  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send({
      token: 'hjgynvgv',
      orderId: order.id,
    })
    .expect(401);
});

it('Returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  // New order
  const order = new Order({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    __v: 0,
    price: 20,
    status: OrderStatus.ORDER_CANCELLED,
  });
  await order.save();

  // New payment
  await request(app)
    .post('/api/payments')
    .set('Cookie', signup(userId))
    .send({
      token: 'hjgynvgv',
      orderId: order.id,
    })
    .expect(400);
});

it('Returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  // Create new order
  const order = new Order({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    __v: 0,
    price,
    status: OrderStatus.ORDER_CREATED,
  });
  await order.save();

  // Fetch created order
  const savedOrder = await Order.findById(order.id);

  // Create new payment
  const stripeResponse = await request(app)
    .post('/api/payments')
    .set('Cookie', signup(userId))
    .send({
      orderId: savedOrder.id,
      token: 'tok_visa',
    })
    .expect(201);

  // Fetch list of charges form Stripe
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined(); // toBeDefined means its not undefined
  expect(stripeCharge.metadata.order_id === savedOrder.id);

  // Check payment doc saved in local database
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge.id,
  });

  expect(payment.id === stripeCharge.id);
});
