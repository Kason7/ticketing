const nats = require('node-nats-streaming');
const crypto = require('crypto');
const { randomBytes } = crypto;
const { TicketCreatedPublisher } = require('./events/ticketCreatedPublisher');

// Clear console to have clean overview
console.clear();

// Generate random Client ID for horizontal NATS streaming scaling
const randomId = randomBytes(4).toString('hex');

// Configuring and connecting NATS streaming client
const stan = nats.connect('ticketing', `ticketing-publisher-${randomId}`, {
  url: 'http://localhost:4222',
});

// Illustrating connection is achieved and logging events
stan.on('connect', async () => {
  console.log('Publisher has connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'Concert',
      price: 30,
    });
  } catch (err) {
    console.error(err);
  }

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'Concert',
  //   price: 20,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
});
