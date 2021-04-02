const Import = require('@kason7-ticketing/common');
const { Publisher } = Import('events', 'basePublisher');
const { Subject } = Import('events', 'subjects');

// Extend Base Publisher
class OrderCreatedPublisher extends Publisher {
  subject = Subject.ORDER_CREATED;
}

exports.OrderCreatedPublisher = OrderCreatedPublisher;
