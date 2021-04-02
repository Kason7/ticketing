const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');

// IMPORT MODELS
const Ticket = require('../models/Ticket');

// CHILDREN CLASS
class TicketCreatedListener extends Listener {
  subject = Subject.TICKET_CREATED;
  queueGroupName = QueueGroupName.ORDER_SERVICE;

  async onMessage(data, msg) {
    // Extract incoming data from event
    const { title, price, id } = data;

    // Format data into local service model/collection
    const ticket = new Ticket({
      // Make sure ID in local database match the ID in external database
      _id: id,
      title,
      price,
    });

    // Save document to local service database
    await ticket.save();

    // Confirm the event has succesfully been processed
    msg.ack();
  }
}

exports.TicketCreatedListener = TicketCreatedListener;
