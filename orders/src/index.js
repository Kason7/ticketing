const mongoose = require('mongoose')
const app = require('./app')
const { NatsWrapper } = require('./natsWrapper')
const { TicketCreatedListener } = require('./events/ticketCreatedListener')
const { TicketUpdatedListener } = require('./events/ticketUpdatedListener')
const {
  ExpirationCompletedListener,
} = require('./events/expirationCompletedListener')
const { PaymentCreatedListener } = require('./events/paymentCreatedListener')

// CONNECT TO MONGODB
const start = async () => {
  console.log('Starting...')

  // Check if necessary environment variables exists
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }
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

  // Activating listeners
  new TicketCreatedListener(NatsWrapper.client()).listen()
  new TicketUpdatedListener(NatsWrapper.client()).listen()
  new ExpirationCompletedListener(NatsWrapper.client()).listen()
  new PaymentCreatedListener(NatsWrapper.client()).listen()

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  console.log('Connected to mongoDB')

  // LAUNCH SERVER
  app.listen(3000, () => {
    console.log('Listening on port 3000')
  })
}

// START UP THE DB CONNECTION
start()
