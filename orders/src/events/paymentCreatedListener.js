// IMPORT MODELS
const Order = require('../models/Order');

// IMPORT COMMONS
const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');
const { OrderStatus } = Import('events', 'orderStatus');

// CHILDREN CLASS
class PaymentCreatedListener extends Listener {
  subject = Subject.PAYMENT_CREATED;
  queueGroupName = QueueGroupName.ORDER_SERVICE;

  async onMessage(data, msg) {
    // Fetch order from incoming event data
    const order = await Order.findById(data.orderId);

    // Check if order exist
    if (!order) {
      throw new Error('Order not found');
    }

    // Update status of order in local database
    order.set({
      status: OrderStatus.ORDER_COMPLETE,
    });
    await order.save();

    // Confirm the event has succesfully been processed
    msg.ack();
  }
}

exports.PaymentCreatedListener = PaymentCreatedListener;
