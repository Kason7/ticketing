const faker = require('faker');
const mongoose = require('mongoose');
const Ticket = require('../../models/Ticket');

it('It implement optimistic concurency control', async (done) => {
  // Create an instance of a ticket
  const ticket = new Ticket({
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    userId: new mongoose.Types.ObjectId(),
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make to seperate parallel changes to the ticket
  await firstInstance.set({ price: 10 });
  await secondInstance.set({ price: 15 });

  // Save the first change to the ticket
  await firstInstance.save();

  // Attempt to save the second change to the ticket, call done() when error is catched
  try {
    await secondInstance.save();
  } catch (e) {
    return done();
  }
  throw new Error('Version increment control failing');
});

it('increment the version number on multiple saves', async () => {
  const ticket = new Ticket({
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    userId: new mongoose.Types.ObjectId(),
  });

  await ticket.save();
  expect(ticket.__v).toEqual(0);

  await ticket.save();
  expect(ticket.__v).toEqual(1);

  await ticket.save();
  expect(ticket.__v).toEqual(2);
});
