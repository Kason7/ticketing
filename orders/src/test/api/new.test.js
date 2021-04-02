const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const faker = require('faker');

// IMPORT MODELS
const Ticket = require('../../models/Ticket');
const Order = require('../../models/Order');

// IMPORT TOOLS
const Import = require('@kason7-ticketing/common');
const { NatsWrapper } = require('../../natsWrapper');
const { OrderStatus } = Import('events', 'orderStatus');

// Auth tests
it('Returns a 200 status if user is signed in', async () => {
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', global.signup())
    .send({})
    .expect(200);
});

// MongoDB tests
it('Checks if a ticket is created', async () => {
  // Creating a ticket
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  // Looking for the ticket that was created
  const savedTicket = await Ticket.findById(ticket.id);

  // Matching the id's of the created ticket and found ticket
  expect(ticket.id === savedTicket.id);
});

it('Checks if a ticket is properly reserved by an order', async () => {
  // Creating a ticket
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  // Looking for the ticket that was created
  const savedTicket = await Ticket.findById(ticket.id);

  // Creating the first order that reserves the ticket
  const order = new Order({
    ticketId: ticket.id,
    userId: 'ygngynn',
    status: OrderStatus.ORDER_CREATED,
    expiresAt: new Date(),
  });
  await order.save();

  // Looking for the order that was created
  const savedOrder = await Ticket.findById(ticket.id);

  // Matching the id's of the created ticket and created order
  expect(savedTicket.id === savedOrder.TicketId);
});

// Route tests
it('Returns a 404 error if a ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signup())
    .send({ ticketId })
    .expect(404);
});

it('Creates a ticket and an order that reserves it', async () => {
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signup())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('Returns an error if the ticket is already reserved', async () => {
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signup())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .post('/api/orders')
    .set('Cookie', signup())
    .send({ ticketId: ticket.id })
    .expect(400);
});

// Event tests
// it('Emits an order created event', async () => {
//   const ticket = new Ticket({
//     title: faker.commerce.productName(),
//     price: faker.finance.amount(),
//   });
//   await ticket.save();

//   await request(app)
//     .post('/api/orders')
//     .set('Cookie', signup())
//     .send({ ticketId: ticket.id })
//     .expect(201);

//   expect(NatsWrapper.client().publish()).toHaveBeenCalled();
// });
