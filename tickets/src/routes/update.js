const express = require('express');
const { body } = require('express-validator');
const Import = require('@kason7-ticketing/common');
const isAuthenticated = Import('middlewares', 'isAuthenticated');
const isValid = Import('middlewares', 'isValid');
const { NotFoundError, NotAuthorizedError, BadRequestError } = Import('errors');
const Ticket = require('../models/Ticket');
const {
  TicketUpdatedPublisher,
} = require('../events/publishers/ticketUpdatedPublisher');
const { NatsWrapper } = require('../natsWrapper');

const router = express.Router();

// UPDATE TICKET ROUTE
router.put(
  '/api/tickets/:id',
  isAuthenticated,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than zero'),
  ],
  isValid,
  async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save(ticket);

    // Emitting the event to NATS stream and other microservices
    new TicketUpdatedPublisher(NatsWrapper.client()).publish({
      // Pull data after being passed through mongodb, to make sure any custom presave mongo db hooks are considered
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      __v: ticket.__v,
    });

    res.send(ticket);
  }
);

module.exports = router;
