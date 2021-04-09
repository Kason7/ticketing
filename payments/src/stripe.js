const Stripe = require('stripe');

exports.stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: '2020-03-02',
});
