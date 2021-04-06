const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');

const { NatsWrapper } = require('../../natsWrapper');
const { expirationQueue } = require('../../queues/expirationQueue');

// CHILDREN CLASS
class OrderCreatedListener extends Listener {
  subject = Subject.ORDER_CREATED;
  queueGroupName = QueueGroupName.EXPIRATION_SERVICE;

  async onMessage(data, msg) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );
    msg.ack();
  }
}

exports.OrderCreatedListener = OrderCreatedListener;
