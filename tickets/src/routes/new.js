const express = require('express');
const router = express.Router();
const Import = require('@kason7-ticketing/common');
const isAuthenticated = Import('middlewares', 'isAuthenticated');
const isValid = Import('middlewares', 'isValid');
const { body } = require('express-validator');
const Ticket = require('../models/Ticket');
const {
  TicketCreatedPublisher,
} = require('../events/publishers/ticketCreatedPublisher');
const { NatsWrapper } = require('../natsWrapper');

router.post(
  '/api/tickets',
  isAuthenticated,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than zero'),
  ],
  isValid,
  async (req, res) => {
    const { title, price } = req.body;

    // DEFINE FIELDS
    const ticketFields = {
      title,
      price,
      userId: req.currentUser.id,
    };

    const ticket = new Ticket(ticketFields);
    await ticket.save();

    // Emitting the event to NATS stream and other microservices
    new TicketCreatedPublisher(NatsWrapper.client()).publish({
      // Pull data after being passed through mongodb, to make sure any custom presave mongo db hooks are considered
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      __v: ticket.__v,
    });

    res.status(201).send(ticket);
  }
);

module.exports = router;
