const express = require('express')
const { body } = require('express-validator')
const mongoose = require('mongoose')

// IMPORT MIDDLEWARES
const Import = require('@kason7-ticketing/common')
const isAuthenticated = Import('middlewares', 'isAuthenticated')
const isValid = Import('middlewares', 'isValid')

// IMPORT COMMONS
const { NotFoundError } = Import('errors')
const { BadRequestError } = Import('errors')
const { OrderStatus } = Import('events', 'orderStatus')

// IMPORT MODELS
const Ticket = require('../models/Ticket')
const Order = require('../models/Order')

// IMPORT EVENTS
const { OrderCreatedPublisher } = require('../events/orderCreatedPublisher')
const { NatsWrapper } = require('../natsWrapper')

// CONFIGS
const EXPIRATION_WINDOW_SECONDS = 1 * 60

const router = express.Router()

// CREATE A NEW ORDER
router.post(
  '/api/orders',
  isAuthenticated,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  isValid,
  async (req, res) => {
    // Pull out the ticket id from the order request
    const { ticketId } = req.body

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      throw new NotFoundError()
    }

    // Make sure the ticket is not already reserved
    const isReserved = await Order.findOne({
      ticketId,
      status: {
        $in: [
          OrderStatus.ORDER_CREATED,
          OrderStatus.ORDER_PENDING,
          OrderStatus.ORDER_CANCELLED,
        ],
      },
    })
    if (isReserved) {
      throw new BadRequestError('Ticket it already reserved')
    }

    // Calculate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Build the order and save it to the database
    const order = new Order({
      ticketId,
      userId: req.currentUser.id,
      status: OrderStatus.ORDER_CREATED,
      expiresAt: expiration,
    })
    await order.save()

    // Injecting ticket data to returned order object
    const savedOrder = await Order.findById(order.id).populate('ticketId')

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(NatsWrapper.client()).publish({
      id: order.id,
      __v: order.__v,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticketId: {
        id: ticket.id,
        price: ticket.price,
      },
    })

    res.status(201).send(savedOrder)
  },
)

module.exports = router
