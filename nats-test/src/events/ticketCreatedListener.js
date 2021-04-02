const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');

// Extend Listen
class TicketCreatedListener extends Listener {
  subject = 'ticket:created';
  queueGroupName = 'payments-service';

  onMessage(data, msg) {
    console.log('Event data!', data);

    // Lets NATS stream know the event has been processed
    msg.ack();
  }
}

exports.TicketCreatedListener = TicketCreatedListener;
