const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');
const { NatsWrapper } = require('../natsWrapper');

// IMPORT MODELS
const Order = require('../models/Order');

// CHILDREN CLASS
class OrderCreatedListener extends Listener {
  subject = Subject.ORDER_CREATED;
  queueGroupName = QueueGroupName.PAYMENT_SERVICE;

  async onMessage(data, msg) {
    // Format data into local service model/collection
    const order = new Order({
      // Make sure ID in local database match the ID in external database
      _id: data.id,
      price: data.ticketId.price,
      status: data.status,
      userId: data.userId,
      __v: data.__v,
    });

    // Save document to local service database
    await order.save();

    // Confirm the event has succesfully been processed
    msg.ack();
  }
}

exports.OrderCreatedListener = OrderCreatedListener;
