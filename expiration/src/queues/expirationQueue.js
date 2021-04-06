const Queue = require('bull');
const { NatsWrapper } = require('../natsWrapper');
const {
  ExpirationCompletedPublisher,
} = require('../events/publishers/expirationCompletedPublisher');

const expirationQueue = new Queue('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  try {
    await new ExpirationCompletedPublisher(NatsWrapper.client()).publish({
      orderId: job.data.orderId,
    });
  } catch (err) {
    console.log('expirationQueue - ', err);
  }
});

exports.expirationQueue = expirationQueue;
