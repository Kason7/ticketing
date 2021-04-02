const Import = require('@kason7-ticketing/common');
const { Publisher } = Import('events', 'basePublisher');
const { Subject } = Import('events', 'subjects');

// Extend Base Publisher
class TicketCreatedPublisher extends Publisher {
  subject = Subject.TICKET_CREATED;
}

exports.TicketCreatedPublisher = TicketCreatedPublisher;
