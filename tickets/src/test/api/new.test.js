const request = require('supertest');
const app = require('../../app');
const Ticket = require('../../models/Ticket');
const { NatsWrapper } = require('../../natsWrapper');

it('Has a route handler listening to /api/tickets for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('Can only be accessed if user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('Returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('It returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      price: 10,
    })
    .expect(400);
});

it('It returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title: 'gtfynbmhu',
      price: -10,
    })
    .expect(400);
});

it('It returns an error if no price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title: 'ukhuymgy',
    })
    .expect(400);
});

it('Creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'ukhuymgy';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title,
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});

// it('Publishes an event', async () => {
//   const title = 'ukhuymgy';

//   await request(app)
//     .post('/api/tickets')
//     .set('Cookie', signup())
//     .send({
//       title,
//       price: 20,
//     })
//     .expect(201);

//   expect(NatsWrapper.client().publish).toHaveBeenCalled();
// });
