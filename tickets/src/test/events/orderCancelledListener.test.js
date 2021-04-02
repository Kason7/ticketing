const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const {
  OrderCancelledListener,
} = require('../../events/listeners/orderCancelledListener');
const Ticket = require('../../models/Ticket');

// SETUP FUNCTION TO MOCK LISTENER
const cancelListenerSetup = async () => {
  const listener = new OrderCancelledListener(NatsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();

  // Create new ticket
  const ticket = new Ticket({
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.set({ orderId });
  await ticket.save();

  // Fake order event
  const data = {
    __v: 0,
    id: orderId,
    status: 'ORDER_CREATED',
    ticketId: {
      id: ticket.id,
    },
  };

  const msg = {
    ack: jest.fn(),
  };
  return { listener, data, ticket, orderId, msg };
};

// EVENT TESTS
it('Updates the ticket, publishes and acks the message', async () => {
  const { listener, data, ticket, orderId, msg } = await cancelListenerSetup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket.orderId).toEqual(undefined);
  expect(msg.ack).toHaveBeenCalled();
});
