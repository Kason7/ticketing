const mongoose = require('mongoose');
const { updateIfCurrentPlugin } = require('mongoose-update-if-current');
const Order = require('./Order');

// IMPORT COMMONS
const Import = require('@kason7-ticketing/common');
const { OrderStatus } = Import('events', 'orderStatus');

const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

TicketSchema.plugin(updateIfCurrentPlugin);

TicketSchema.statics.findByEvent = (event) => {
  return Ticket.findOne({ _id: event.id, __v: event.__v - 1 });
};

// TicketSchema.methods.isReserved = async function () {
//   const existingOrder = await Order.findOne({
//     _ticket: this,
//     status: {
//       $in: [
//         OrderStatus.ORDER_CREATED,
//         OrderStatus.ORDER_PENDING,
//         OrderStatus.ORDER_COMPLETE,
//       ],
//     },
//   });
//   return existingOrder;
// };

TicketSchema.options.toJSON = {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
};

module.exports = Ticket = mongoose.model('tickets', TicketSchema);
