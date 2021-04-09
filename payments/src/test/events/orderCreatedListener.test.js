const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const { OrderCreatedListener } = require('../../events/orderCreatedListener');
const Order = require('../../models/Order');

// IMPORT COMMONS
const Import = require('@kason7-ticketing/common');
const { OrderStatus } = Import('events', 'orderStatus');

// SETUP FUNCTION TO MOCK LISTENER
const setup = async () => {
  // Initialize NATS client
  const listener = new OrderCreatedListener(NatsWrapper.client);

  // Create the fake event data
  const data = {
    __v: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.ORDER_CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expireAt: Date.now(),
    ticketId: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  const msg = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

// EVENT TESTS
it('Replicates the order locally from incoming event', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order.id).toEqual(data.id);
});

it('Acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
