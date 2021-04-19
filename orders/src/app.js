const express = require('express')
require('express-async-errors')
const cookieSession = require('cookie-session')

// IMPORT MIDDLEWARE
const { json } = require('body-parser')
const Import = require('@kason7-ticketing/common')
const isError = Import('middlewares', 'isError')
const isCurrentUser = Import('middlewares', 'isCurrentUser')
const { NotFoundError } = Import('errors')

// IMPORT ROUTES
const createOrderRouter = require('./routes/new')
const showOrderRouter = require('./routes/show')
const showOrdersRouter = require('./routes')
const deleteOrderRouter = require('./routes/delete')

// APPLY MIDDLEWARE
const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: false,
  }),
)
app.use(isCurrentUser)

// APPLY ROUTES
app.use(createOrderRouter)
app.use(showOrderRouter)
app.use(showOrdersRouter)
app.use(deleteOrderRouter)

// HANDLING REQUESTS TO ROUTES THAT DOESN'T EXIST
app.all('*', async (req, res) => {
  throw new NotFoundError()
})

// ERROR MIDDLEWARE (GOES LAST)
app.use(isError)

module.exports = app
