const express = require('express');

// IMPORT MIDDLEWARE
const Import = require('@kason7-ticketing/common');
const isCurrentUser = Import('middlewares', 'isCurrentUser');

const router = express.Router();

router.get('/api/users/currentuser', isCurrentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

module.exports = router;
