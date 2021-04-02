const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const faker = require('faker');

// IMPORT MODELS
const Ticket = require('../../models/Ticket');
const Order = require('../../models/Order');

// IMPORT TOOLS
const Import = require('@kason7-ticketing/common');
const { OrderStatus } = Import('events', 'orderStatus');

// Auth tests
it('Returns a 200 status if user is signed in', async () => {
  await request(app)
    .get('/api/orders')
    .set('Cookie', global.signup())
    .send({})
    .expect(200);
});

// MongoDB & Route tests
const buildTicket = async () => {
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  return ticket;
};
it('Fetches order from a particular user', async () => {
  // Create 3 tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  // Create 2 users
  const userOne = global.signup();
  const userTwo = global.signup();

  // Create 1 order as user #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create 2 orders as user #2
  const { body: responseOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: responseTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for user #2
  const { body } = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the orders for user #2
  expect(body.length).toEqual(2);
  expect(body[0].id === responseOne.id);
  expect(body[1].id === responseTwo.id);
});
