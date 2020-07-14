import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signup(): string[];
    }
  }
}

jest.mock('@bavjacksontickets/common', () => {
  const original = jest.requireActual('@bavjacksontickets/common');

  return {
    __esmodule: true,
    ...original,
    natsWrapper: {
      client: {
        publish: jest
          .fn()
          .mockImplementation(
            (subject: string, data: string, callback: () => void) => {
              callback();
            }
          ),
      },
    },
  };
});

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signup = () => {
  // build a jwt payload {id, email}
  const id = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id,
    email: 'test@test.com',
  };

  // create jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object {jwt: MY_JWT}
  const session = { jwt: token };

  // turn session into json
  const sessionJSON = JSON.stringify(session);

  // take JSON and encode as base 64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return string as cookie with encoded data
  return [`express:sess=${base64}`];
};
