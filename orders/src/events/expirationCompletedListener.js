const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');
const { OrderStatus } = Import('events', 'orderStatus');
const { OrderCancelledPublisher } = require('./orderCancelledPublisher');
const { NatsWrapper } = require('../natsWrapper');

// IMPORT MODELS
const Order = require('../models/Order');

// CHILDREN CLASS
class ExpirationCompletedListener extends Listener {
  subject = Subject.EXPIRATION_COMPLETED;
  queueGroupName = QueueGroupName.EXPIRATION_SERVICE;

  async onMessage(data, msg) {
    // Find the order to be cancelled with expiration
    const order = await Order.findById(data.orderId).populate('ticketId');

    // Throw error if not found
    if (!order) {
      throw new Error('Order not found');
    }

    // Return early if order already has been paid
    if (order.status === OrderStatus.ORDER_COMPLETE) {
      return msg.ack();
    }

    // Change status of order
    order.set({
      status: OrderStatus.ORDER_CANCELLED,
    });

    // Save document to local service database
    await order.save();

    // Publish cancelled event to other services
    new OrderCancelledPublisher(NatsWrapper.client()).publish({
      id: order.id,
      __v: order.__v,
      ticketId: {
        id: order.ticketId.id,
      },
    });

    // Confirm the event has succesfully been processed
    msg.ack();
  }
}

exports.ExpirationCompletedListener = ExpirationCompletedListener;
