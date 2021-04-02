const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const { TicketCreatedListener } = require('../../events/ticketCreatedListener');
const Ticket = require('../../models/Ticket');

// SETUP FUNCTION TO MOCK EVENT LISTENER
const createdListenerSetup = async () => {
  const listener = new TicketCreatedListener(NatsWrapper.client);
  const data = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: faker.commerce.productName(),
    price: faker.finance.amount(),
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const msg = {
    // Simulation of the ack funktion in jest (jest.fn() is an evoke funktion in jest)
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

// EVENT TESTS
it('Creates and saves a ticket', async () => {
  const { listener, data, msg } = await createdListenerSetup();
  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket.title).toEqual(data.title);
  expect(ticket.price.toString()).toEqual(data.price);
});

it('Acks the message when created', async () => {
  const { listener, data, msg } = await createdListenerSetup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
