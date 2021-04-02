const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');

// IMPORT MODELS
const Ticket = require('../models/Ticket');

// CHILDREN CLASS
class TicketUpdatedListener extends Listener {
  subject = Subject.TICKET_UPDATED;
  queueGroupName = QueueGroupName.ORDER_SERVICE;

  async onMessage(data, msg) {
    // Find ticket in local database (see findByEvent helper in model file)
    const ticket = await Ticket.findByEvent(data);

    // Throw error if not found
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Format updated values, from incoming data
    const ticketContent = {
      title: data.title,
      price: data.price,
    };

    // Save document in local database with new values
    await ticket.set(ticketContent).save();

    // Confirm to NATS stream that event has been processed
    msg.ack();
  }
}
exports.TicketUpdatedListener = TicketUpdatedListener;
