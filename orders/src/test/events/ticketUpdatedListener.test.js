const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const { TicketUpdatedListener } = require('../../events/ticketUpdatedListener');
const Ticket = require('../../models/Ticket');

// SETUP FUNCTION TO MOCK EVENT LISTENER
const updatedListenerSetup = async () => {
  const listener = new TicketUpdatedListener(NatsWrapper.client);

  const ticket = new Ticket({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: Math.trunc(faker.finance.amount()),
  });

  await ticket.save();

  const data = {
    id: ticket.id,
    __v: ticket.__v + 1,
    title: faker.commerce.productName(),
    price: Math.trunc(faker.finance.amount()),
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg = {
    ack: jest.fn(),
  };
  return { listener, data, ticket, msg };
};

// EVENT TESTS
it('Find, update and save a ticket', async () => {
  const { listener, data, ticket, msg } = await updatedListenerSetup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket.title).toEqual(data.title);
  expect(updatedTicket.price).toEqual(data.price);
  expect(updatedTicket.__v).toEqual(data.__v);
});

it('Acks the message when update', async () => {
  const { listener, data, ticket, msg } = await updatedListenerSetup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("Doesn't call ack if version is not corresponding", async () => {
  const { listener, data, ticket, msg } = await updatedListenerSetup();

  data.__v = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (e) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
