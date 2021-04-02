const express = require('express');
const Ticket = require('../models/Ticket');

const Import = require('@kason7-ticketing/common');
const { NotFoundError } = Import('errors');

const router = express.Router();

router.get('/api/tickets/:id', async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

module.exports = router;
