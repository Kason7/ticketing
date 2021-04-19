const mongoose = require('mongoose')
const app = require('./app')

// CONNECT TO MONGODB
const start = async () => {
  console.log('Starting up....')

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to mongoDB')
  } catch (err) {
    console.error(err)
  }
}

// LAUNCH SERVER
app.listen(3000, () => {
  console.log('Listening on port 3000')
})

// START UP THE DB CONNECTION
start()
