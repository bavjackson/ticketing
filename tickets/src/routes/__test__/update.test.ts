import request from 'supertest';

import { app } from '../../app';
import mongoose from 'mongoose';

import { Ticket } from '../../models/ticket';

import { natsWrapper } from '@bavjacksontickets/common';

it('returns 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signup())
    .send({
      title: 'a ticket',
      price: 10,
    })
    .expect(404);
});

it('returns 401 if user not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'a ticket',
      price: 10,
    })
    .expect(401);
});

it('returns 401 if user does not own the ticket', async () => {
  const title = 'a ticket';
  const price = 10;
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signup())
    .send({
      title,
      price,
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({
      title: 'a ticket title',
      price: 1000,
    })
    .expect(401);

  const ticket = await Ticket.findById(response.body.id);

  expect(ticket!.title).toEqual(title);
  expect(ticket!.price).toEqual(price);
});

it('returns 400 if user provides an invalid title or price', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'a ticket',
      price: 10,
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
      price: 20,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'stuff',
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'a ticket',
      price: 10,
    });

  const newTitle = 'an updated ticket';
  const newPrice = 20;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(ticketResponse.body.price).toEqual(newPrice);
});

it('publishes an event', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'a ticket',
      price: 10,
    });

  const newTitle = 'an updated ticket';
  const newPrice = 20;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if ticket is reserved', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'a ticket',
      price: 10,
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  const newTitle = 'an updated ticket';
  const newPrice = 20;
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice,
    })
    .expect(400);
});
