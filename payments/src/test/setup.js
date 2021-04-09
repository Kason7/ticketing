const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

let mongo;

// MOCKED FILES
jest.mock('../natsWrapper', () => require('./mocks/natsWrapper'));
// jest.mock('../stripe', () => require('./mocks/stripe'));

// STRIPE TEST KEY
process.env.STRIPE_KEY =
  'sk_test_51IeLn3HeNGJ10Jfido3qrqWoK59q3Xpc2kDnmAn9y49Ka5KMSq3wCIMwzjnd7q1ATUXWy5jBhomAJRyeGV7phSJz00azlNH1KM';

// Global test configuration functions
beforeAll(async () => {
  jest.clearAllMocks();

  process.env.JWT_KEY = 'asdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

signup = (id) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY);
  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // Return a string thats the cookie with the encoded data
  return `express:sess=${base64}`;
};
