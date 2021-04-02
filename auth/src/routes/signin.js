const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// IMPORT MIDDLEWARE
const Import = require('@kason7-ticketing/common');
const isValid = Import('middlewares', 'isValid');
const { BadRequestError } = Import('errors');

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password required'),
  ],
  isValid,
  async (req, res) => {
    const { email, password } = req.body;

    // HANDLE EXISTING USER
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    // CHECK MATCH
    const match = await bcrypt.compareSync(password, existingUser.passwordHash);

    if (!match) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate json token
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY
    );

    // Store it on session object
    req.session.jwt = userJwt;

    res.status(200).send(existingUser);
  }
);

module.exports = router;
