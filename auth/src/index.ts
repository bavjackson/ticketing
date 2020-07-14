import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('starting up...')
  if (!process.env.JWT_KEY) {
    throw new Error('JWT token must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined');
  }

  try {
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