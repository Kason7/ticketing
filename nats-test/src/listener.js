const nats = require('node-nats-streaming');
const crypto = require('crypto');
const { randomBytes } = crypto;
const { TicketCreatedListener } = require('./events/ticketCreatedListener');

// Clear console to have clean overview
console.clear();

// Generate random Client ID for horizontal NATS streaming scaling
const randomId = randomBytes(4).toString('hex');
const uniqueClientId = `ticketing-listener-${randomId}`;

// Configuring and connecting NATS streaming client
const stan = nats.connect('ticketing', uniqueClientId, {
  url: 'http://localhost:4222',
});

// Illustrating connection is achieved and logging events
stan.on('connect', () => {
  console.log(`Listener (${uniqueClientId}) has connected to NATS`);

  // Detect if client is about to close, then make sure no events are processed
  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

// Observe interuption and make sure client closes properly before connection closes
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
