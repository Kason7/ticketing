const { NatsWrapper } = require('./natsWrapper')
const {
  OrderCreatedListener,
} = require('./events/listeners/orderCreatedListener')

// SERVICE CONFIG
const start = async () => {
  console.log('Starting...')

  // Check if necessary environment variables exists
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined')
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined')
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined')
  }

  // Connect to NATS streaming client
  await NatsWrapper.connect(
    // First argument is the cluster id (can be found in pod spec, under -cid)
    process.env.NATS_CLUSTER_ID,
    // Second argument is the client id, in this case just random string
    process.env.NATS_CLIENT_ID,
    // Third argument is the service url that govern access to NATS deployment
    process.env.NATS_URL,
  )
  // Detect if client is about to close, then make sure no events are processed
  NatsWrapper.client().on('close', () => {
    console.log('NATS connection closed!')
    process.exit()
  })
  // Observe interuption and make sure client closes properly before connection closes
  process.on('SIGINT', () => NatsWrapper.client().close())
  process.on('SIGTERM', () => NatsWrapper.client().close())

  // Activate listeners
  new OrderCreatedListener(NatsWrapper.client()).listen()
}

// LAUNCH SERVICE
start()
