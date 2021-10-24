const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/waitlist';

// Command to Execute: node scripts/trymongo.js

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(function(err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('guests');

    const guest = {
        id: 2, name: 'Eve', contact: 82345618,
        arrival: new Date('2019-01-16'), remove: 'Remove',
      };

    collection.insertOne(guest, function(err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log('Result of insert:\n', result.insertedId);
      collection.find({ _id: result.insertedId})
        .toArray(function(err, docs1) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log('Result of find:\n', docs1);
        client.close();
        callback(err);
      });
    });

    collection.remove({ id: { $eq: 2 }}, function(err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log('Result of remove:\n', result);
      collection.find()
        .toArray(function(err, docs2) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log('Result of find:\n', docs2);
        client.close();
        callback(err);
      });
    });

  });
}

async function testWithAsync() {
  console.log('\n--- testWithAsync ---');
  var client = new MongoClient(url, { useNewUrlParser: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    var db = client.db();
    var collection = db.collection('guests');

    var guest = {
        id: 3, name: 'Evelyn', contact: 82445618,
        arrival: new Date('2019-01-16'), remove: 'Remove',
      };
    var result = await collection.insertOne(guest);
    console.log('Result of insert:\n', result.insertedId);
    var docs3 = await collection.find({ _id: result.insertedId })
      .toArray();
    console.log('Result of find:\n', docs3);

    result = await collection.remove({ id: { $eq: 3 }});
    console.log('Result of remove:\n', result);
    var docs4 = await collection.find()
      .toArray();
    console.log('Result of find:\n', docs4);

  } catch(err) {
    console.log(err);
  } finally {
    client.close();
  }
}

testWithCallbacks(function(err) {
  if (err) {
    console.log(err);
  }
  testWithAsync();
});
