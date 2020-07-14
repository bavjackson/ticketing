import mongoose from 'mongoose';
import { natsWrapper } from '@bavjacksontickets/common';

import { app } from './app';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT token must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined');
  }
  if (!process.env.STRIPE_KEY) {
    throw new Error('Stripe secret key must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('Client Id must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS cluster ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('connected to mongodb');
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log('listening on port 3000');
  });
};

start();
