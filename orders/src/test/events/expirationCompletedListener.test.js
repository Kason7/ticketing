const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const {
  ExpirationCompletedListener,
} = require('../../events/expirationCompletedListener');
const Order = require('../../models/Order');
const Ticket = require('../../models/Ticket');

// IMPORT TOOLS
const Import = require('@kason7-ticketing/common');
const { OrderStatus } = Import('events', 'orderStatus');

// SETUP FUNCTION TO MOCK EVENT LISTENER
const setup = async () => {
  const listener = new ExpirationCompletedListener(NatsWrapper.client);

  // Creating and saving a ticket
  const ticket = new Ticket({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: Math.trunc(faker.finance.amount()),
  });
  await ticket.save();

  // Creating and saving an order
  const order = new Order({
    ticketId: ticket.id,
    userId: 'ygngynn',
    status: OrderStatus.ORDER_CREATED,
    expiresAt: new Date(),
  });
  await order.save();

  // The incoming event data that cancels the order
  const data = {
    orderId: order.id,
  };

  const msg = {
    // Simulation of the ack funktion in jest (jest.fn() is an evoke funktion in jest)
    ack: jest.fn(),
  };
  return { listener, ticket, order, data, msg };
};

it('Updates the order status to cancelled', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder.status).toEqual(OrderStatus.ORDER_CANCELLED);
});

// it('Emits an order cancelled event', async () => {
//   const { listener, ticket, order, data, msg } = await setup();

//   await listener.onMessage(data, msg);

// });

it('Acks the message', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
