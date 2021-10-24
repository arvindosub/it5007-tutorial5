const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/waitlist';

let db;

let aboutMessage = "Hotel California Waitlist API v1.0";

const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    guestList,
  },
  Mutation: {
    setAboutMessage,
    guestAdd,
    guestRemove,
    guestUpdate
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function guestList() {
  const guests = await db.collection('guests').find({}).toArray();
  return guests;
}

async function getNextSequence() {
  const result = await db.collection('guests').count();
  return result+1;
}

async function updateCount(name) {
  const count = await db.collection('guests').count();
  await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $set: { current: count } },
    { returnOriginal: false },
  );
}

function guestValidate(guest) {
  const errors = [];
  if (guest.name.length < 3) {
    errors.push('Guest name must be at least 3 characters long!');
  }
  if (guest.contact.length > 8) {
    errors.push('Contact number must only be 8 digits long!');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function guestAdd(_, { guest }) {
  guestValidate(guest);
  guest.arrival = new Date();
  guest.id = await getNextSequence();

  const result = await db.collection('guests').insertOne(guest);
  const savedGuest = await db.collection('guests')
    .findOne({ _id: result.insertedId });
  await updateCount('guests');
  return savedGuest;
}

async function guestRemove(_, {id}) {
  const removed = await db.collection('guests').remove({id:id}, true);
  console.log(removed);
  await updateCount('guests');
}

async function guestUpdate(_, {oldId, newId}) {
  const updated = await db.collection('guests').findOneAndUpdate(
    { id: oldId },
    { $set: { id: newId } },
    { returnOriginal: false }
  );
  console.log(updated);
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(3000, function () {
      console.log('App started on port 3000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();
