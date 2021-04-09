const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  orderId: {
    type: String,
    required: true,
  },
  stripeId: {
    type: String,
    required: true,
  },
});

PaymentSchema.plugin(updateIfCurrentPlugin);

PaymentSchema.options.toJSON = {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
};

module.exports = Payment = mongoose.model('payments', PaymentSchema);
