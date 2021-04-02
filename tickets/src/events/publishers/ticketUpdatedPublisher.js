const Import = require('@kason7-ticketing/common');
const { Publisher } = Import('events', 'basePublisher');
const { Subject } = Import('events', 'subjects');

// Extend Base Publisher
class TicketUpdatedPublisher extends Publisher {
  subject = Subject.TICKET_UPDATED;
}

exports.TicketUpdatedPublisher = TicketUpdatedPublisher;
