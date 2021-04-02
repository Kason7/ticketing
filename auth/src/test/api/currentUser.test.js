const request = require('supertest');
const app = require('../../app');

it('Responds with details about the current user', async () => {
  const cookie = await signup();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send({})
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('Responds with null if not auhtenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
