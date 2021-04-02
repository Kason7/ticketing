const request = require('supertest');
const app = require('../../app');

const createTicket = (title, price) => {
  return request(app).post('/api/tickets').set('Cookie', signup()).send({
    title,
    price,
  });
};

it('Can fetch a list of tickets', async () => {
  await createTicket('First ticket', 20);
  await createTicket('Second ticket', 25);
  await createTicket('Third ticket', 15);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
