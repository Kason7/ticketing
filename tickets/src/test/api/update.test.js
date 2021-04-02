const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { NatsWrapper } = require('../../natsWrapper');

it('Returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signup())
    .send({
      title: 'Test ticket',
      price: 20,
    })
    .expect(404);
});

it('Returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Test ticket',
      price: 20,
    })
    .expect(401);
});

it('Returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signup())
    .send({
      title: 'Another test ticket',
      price: 25,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signup())
    .send({
      title: 'Updated title',
      price: 15,
    })
    .expect(401);
});

it('Returns a 400 if the user provides and invalid title or price', async () => {
  const cookie = signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Another test ticket',
      price: 25,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Valid new title',
      price: -20,
    })
    .expect(400);
});

it('Updates the ticket provided valid inputs', async () => {
  const cookie = signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Another test ticket',
      price: 25,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Updated title',
      price: 30,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('Updated title');
  expect(ticketResponse.body.price).toEqual(30);
});

it('Rejects updates if the ticket is reserved', async () => {
  // Signup and signin a user
  const cookie = signup();

  // User creates a ticket
  const { body } = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Another test ticket',
      price: 25,
    });

  // Fake order event for that ticket
  const ticket = await Ticket.findById(body.id);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  // User attempts to update ticket
  await request(app)
    .put(`/api/tickets/${body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Updated title',
      price: 30,
    })
    .expect(400);
});
