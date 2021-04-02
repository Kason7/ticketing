const Import = require('@kason7-ticketing/common');
const { Listener } = Import('events', 'baseListener');
const { Subject } = Import('events', 'subjects');
const { QueueGroupName } = Import('events', 'queueGroupNames');
const {
  TicketUpdatedPublisher,
} = require('../publishers/ticketUpdatedPublisher');
const { NatsWrapper } = require('../../natsWrapper');

// IMPORT MODELS
const Ticket = require('../../models/Ticket');

// CHILDREN CLASS
class OrderCreatedListener extends Listener {
  subject = Subject.ORDER_CREATED;
  queueGroupName = QueueGroupName.TICKET_SERVICE;

  async onMessage(data, msg) {
    const ticket = await Ticket.findById(data.ticketId.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ orderId: data.id });
    await ticket.save();
    if (process.env.NODE_ENV !== 'test') {
      await new TicketUpdatedPublisher(NatsWrapper.client()).publish(ticket);
    }
    msg.ack();
  }
}

exports.OrderCreatedListener = OrderCreatedListener;
