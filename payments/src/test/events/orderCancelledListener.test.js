const mongoose = require('mongoose');
const faker = require('faker');
const { NatsWrapper } = require('../../natsWrapper');
const { OrderCreatedListener } = require('../../events/orderCreatedListener');
const {
  OrderCancelledListener,
} = require('../../events/orderCancelledListener');
const Order = require('../../models/Order');

// IMPORT COMMONS
const Import = require('@kason7-ticketing/common');
const { OrderStatus } = Import('events', 'orderStatus');

// SETUP FUNCTION TO MOCK LISTENER
const setup = async () => {
  // Create listener
  const createListener = new OrderCreatedListener(NatsWrapper.client);

  // Cancel listener
  const cancelListener = new OrderCancelledListener(NatsWrapper.client);

  // Common id
  const id = new mongoose.Types.ObjectId().toHexString();

  // Create the fake event data
  const createData = {
    __v: 0,
    id,
    status: OrderStatus.ORDER_CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expireAt: Date.now(),
    ticketId: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  // Create cancel event data
  const cancelData = {
    id,
    __v: 1,
  };

  const msg = {
    ack: jest.fn(),
  };
  return { createListener, cancelListener, createData, cancelData, msg };
};

// EVENT TESTS
it('Replicates the order locally from incoming event', async () => {
  const { createListener, createData, msg } = await setup();
  await createListener.onMessage(createData, msg);

  const order = await Order.findById(createData.id);
  expect(order.id).toEqual(createData.id);
});

it('Updates the status on incoming cancel event', async () => {
  const {
    createListener,
    cancelListener,
    createData,
    cancelData,
    msg,
  } = await setup();
  // Replicates the order locally
  await createListener.onMessage(createData, msg);

  // Cancels the order locally
  await cancelListener.onMessage(cancelData, msg);

  // Looks up the order locally
  const cancelledOrder = await Order.findById(createData.id);

  expect(cancelledOrder.status === OrderStatus.ORDER_CANCELLED);
  expect(msg.ack).toHaveBeenCalled();
});
