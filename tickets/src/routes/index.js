const express = require('express')
const Ticket = require('../models/Ticket')

const router = express.Router()

router.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.find({
    orderId: undefined,
  })

  res.send(tickets)
})

module.exports = router
