const Import = require('@kason7-ticketing/common');
const { Publisher } = Import('events', 'basePublisher');
const { Subject } = Import('events', 'subjects');

// Extend Base Publisher
class PaymentCreatedPublisher extends Publisher {
  subject = Subject.PAYMENT_CREATED;
}

exports.PaymentCreatedPublisher = PaymentCreatedPublisher;
