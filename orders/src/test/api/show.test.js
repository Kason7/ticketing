const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const faker = require('faker');

// IMPORT MODELS
const Ticket = require('../../models/Ticket');
const Order = require('../../models/Order');

it('Fetches an order', async () => {
  // Creating a ticket
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  const user = global.signup();

  // Build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);

  expect(fetchedOrder.id === order.id);
});

it('Returns an error if one user tries to fetch another users order', async () => {
  // Creating a ticket
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  // Create user 1
  const userOne = global.signup();

  // Build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Create user 2
  const userTwo = global.signup();

  // Make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .send({})
    .expect(401);

  expect(fetchedOrder.id === order.id);
});
