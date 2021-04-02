const express = require('express');

// IMPORT MIDDLEWARES
const Import = require('@kason7-ticketing/common');
const isAuthenticated = Import('middlewares', 'isAuthenticated');

// IMPORT MODELS
const Order = require('../models/Order');

const router = express.Router();

router.get('/api/orders', isAuthenticated, async (req, res) => {
  const orders = await Order.find({
    userId: req.currentUser.id,
  }).populate('ticketId');

  res.send(orders);
});

module.exports = router;
