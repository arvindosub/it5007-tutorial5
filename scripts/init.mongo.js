/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   - screen mongod ('ctrl-A' then 'd' to close)
 *   - mongo (ensure mongodb is running, then 'exit' to close)
 *   - mongo waitlist scripts/init.mongo.js
*/

db.guests.remove({});

const guestsDB = [
  {
    id: 1, name: 'Adam', contact: 82345678,
    arrival: new Date('2019-01-15'), remove: 'Remove',
  },
];

db.guests.insertMany(guestsDB);
const count = db.guests.count();
print('Inserted', count, 'guests');

db.counters.remove({ _id: 'guests' });
db.counters.insert({ _id: 'guests', current: count });

db.guests.createIndex({ id: 1 }, { unique: true });
db.guests.createIndex({ name: 1 });
db.guests.createIndex({ contact: 1 });
db.guests.createIndex({ status: 1 });
