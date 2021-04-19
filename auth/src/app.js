const express = require('express')
require('express-async-errors')
const cookieSession = require('cookie-session')

// IMPORT MIDDLEWARE
const { json } = require('body-parser')
const Import = require('@kason7-ticketing/common')
const isError = Import('middlewares', 'isError')

// IMPORT ROUTES
const currentuserRouter = require('./routes/currentUser')
const signinRouter = require('./routes/signin')
const signoutRouter = require('./routes/signout')
const signupRouter = require('./routes/signup')
const { NotFoundError } = Import('errors')

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

// APPLY ROUTES
app.use(currentuserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

// HANDLING REQUESTS TO ROUTES THAT DOESN'T EXIST
app.all('*', async (req, res) => {
  throw new NotFoundError()
})

// ERROR MIDDLEWARE (GOES LAST)
app.use(isError)

module.exports = app
