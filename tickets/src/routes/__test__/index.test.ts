import request from 'supertest';

import { app } from '../../app';

const createTicket = (title = 'a ticket', price = 20) => {
  return request(app).post('/api/tickets').set('Cookie', global.signup()).send({
    title,
    price,
  });
};

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket('another ticket', 10);
  await createTicket('a third ticket', 30);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
