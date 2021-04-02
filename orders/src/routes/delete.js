const express = require('express');

// IMPORT MIDDLEWARES
const Import = require('@kason7-ticketing/common');
const isAuthenticated = Import('middlewares', 'isAuthenticated');

// IMPORT COMMONS
const { NotFoundError } = Import('errors');
const { NotAuthorizedError } = Import('errors');
const { OrderStatus } = Import('events', 'orderStatus');

// IMPORT MODELS
const Order = require('../models/Order');

// IMPORT EVENTS
const {
  OrderCancelledPublisher,
} = require('../events/orderCancelledPublisher');
const { NatsWrapper } = require('../natsWrapper');

const router = express.Router();

router.delete('/api/orders/:orderId', isAuthenticated, async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticketId');

  // Check if an order exist with the given id
  if (!order) {
    throw new NotFoundError();
  }

  // Check if the user is matching the order's user
  if (order.userId !== req.currentUser.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.ORDER_CANCELLED;
  await order.save();

  // PUBLISH EVENT SAYING THE ORDER WAS CANCELLED
  new OrderCancelledPublisher(NatsWrapper.client()).publish({
    id: order.id,
    __v: order.__v,
    ticketId: {
      id: order.ticketId.id,
    },
  });

  res.status(204).send(order);
});

module.exports = router;
