const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const {
  OrderCreatedListener,
} = require('../../events/listeners/orderCreatedListener');
const Ticket = require('../../models/Ticket');

// SETUP FUNCTION TO MOCK LISTENER
const createdListenerSetup = async () => {
  // Initialize NATS client
  const listener = new OrderCreatedListener(NatsWrapper.client);

  // Create a new ticket
  const ticket = new Ticket({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // Create the fake event data
  const data = {
    __v: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: 'ORDER_CREATED',
    userId: new mongoose.Types.ObjectId().toHexString(),
    expireAt: Date.now(),
    ticketId: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  const msg = {
    ack: jest.fn(),
  };
  return { listener, data, ticket, msg };
};

// EVENT TESTS
it('Add an order id to the ticket reserved', async () => {
  const { listener, data, ticket, msg } = await createdListenerSetup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket.orderId).toEqual(data.id);
});

it('Acks the message when created', async () => {
  const { listener, data, ticket, msg } = await createdListenerSetup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
