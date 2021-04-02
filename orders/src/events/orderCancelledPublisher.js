const Import = require('@kason7-ticketing/common');
const { Publisher } = Import('events', 'basePublisher');
const { Subject } = Import('events', 'subjects');

// Extend Base Publisher
class OrderCancelledPublisher extends Publisher {
  subject = Subject.ORDER_CANCELLED;
}

exports.OrderCancelledPublisher = OrderCancelledPublisher;
