const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

const Schema = mongoose.Schema;

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.plugin(updateIfCurrentPlugin);

module.exports = Ticket = mongoose.model('Ticket', ticketSchema);
