const express = require('express');

// IMPORT MIDDLEWARES
const Import = require('@kason7-ticketing/common');
const isAuthenticated = Import('middlewares', 'isAuthenticated');

// IMPORT COMMONS
const { NotFoundError } = Import('errors');
const { NotAuthorizedError } = Import('errors');

// IMPORT MODELS
const Order = require('../models/Order');

const router = express.Router();

// Get an order
router.get('/api/orders/:orderId', isAuthenticated, async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('ticketId');

  // Check if an order exist with the given id
  if (!order) {
    throw new NotFoundError();
  }

  // Check if the user is matching the order's user
  if (order.userId !== req.currentUser.id) {
    throw new NotAuthorizedError();
  }

  // Send back the requested order
  res.send(order);
});

module.exports = router;
