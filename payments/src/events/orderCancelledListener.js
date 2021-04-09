const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');
const { OrderStatus } = Import('events', 'orderStatus');
const { NatsWrapper } = require('../natsWrapper');

// IMPORT MODELS
const Order = require('../models/Order');

// CHILDREN CLASS
class OrderCancelledListener extends Listener {
  subject = Subject.ORDER_CANCELLED;
  queueGroupName = QueueGroupName.PAYMENT_SERVICE;

  async onMessage(data, msg) {
    // Find order of incoming event in local database
    const order = await Order.findOne({
      _id: data.id,
      __v: data.__v - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Save updated document to local service database
    order.set({ status: OrderStatus.ORDER_CANCELLED });
    await order.save();

    // Confirm the event has succesfully been processed
    msg.ack();
  }
}

exports.OrderCancelledListener = OrderCancelledListener;
