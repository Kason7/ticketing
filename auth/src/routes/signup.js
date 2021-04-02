const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// IMPORT MIDDLEWARE
const Import = require('@kason7-ticketing/common');
const isValid = Import('middlewares', 'isValid');
const { BadRequestError } = Import('errors');

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  isValid,
  async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    // CHECK IF USER EXISTS
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // DEFINE FIELDS
    const profileFields = {
      email,
      password,
    };

    const user = new User(profileFields);
    await user.save();

    // Generate json token
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY
    );

    // Store it on session object
    req.session.jwt = userJwt;

    res.status(201).send(user);
  }
);

module.exports = router;
