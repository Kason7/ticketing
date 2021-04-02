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

it('Fetches an order', async () => {
  // Creating a ticket
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
  });
  await ticket.save();

  // Create an order
  const user = global.signup();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  // Expect the order is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder.status === OrderStatus.ORDER_CANCELLED);
});

// Event tests
// it('Emits and order cancelled event', async () => {
//   // Creating a ticket
//   const ticket = new Ticket({
//     title: faker.commerce.productName(),
//     price: faker.finance.amount(),
//   });
//   await ticket.save();

//   // Create an order
//   const user = global.signup();
//   const { body: order } = await request(app)
//     .post('/api/orders')
//     .set('Cookie', user)
//     .send({ ticketId: ticket.id })
//     .expect(201);

//   // Cancel the order
//   await request(app)
//     .delete(`/api/orders/${order.id}`)
//     .set('Cookie', user)
//     .send()
//     .expect(204);

//   expect(NatsWrapper.client().publish()).toHaveBeenCalled();
// });
