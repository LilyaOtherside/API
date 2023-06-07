const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();

// parse application/json
app.use(bodyParser.json());

// Configure AWS credentials and region
AWS.config.update({
  accessKeyId: 'ASIAQDSB7LRVU3YBWIMI',
  secretAccessKey: 'by3eD/AftL1cQexZsplVOHb4EOrhq4SFD054S9sU',
  region: 'eu-west-2'
});

const dynamoDB = new AWS.DynamoDB();

let consents = [];

// Get consent by key
app.get('/consent/:key', (req, res) => {
  const consent = consents.find(c => c.key === req.params.key);
  if (!consent) return res.status(404).send('Consent not found');
  res.send({ consent: consent.text });
});

// Create a new consent
app.post('/consent', (req, res) => {
  const consent = {
    key: req.body.key,
    text: req.body.text
  };
  consents.push(consent);
  res.status(201).send(consent);
});

// Update a consent
app.put('/consent/:key', (req, res) => {
  const consent = consents.find(c => c.key === req.params.key);
  if (!consent) return res.status(404).send('The consent with the given key was not found.');

  consent.text = req.body.text;

  res.send(consent);
});

// Add consent to the database cyclically
function addConsentCyclically() {
  if (consents.length === 0) {
    console.log('No consents found. Add consents first.');
    return;
  }

  const consent = consents[0]; // Get the first consent in the cyclic order
  console.log(`Adding consent: ${consent.text}`);

  // Create the DynamoDB item
  const params = {
    TableName: 'your_table_name',
    Item: {
      key: { S: consent.key },
      text: { S: consent.text }
    }
  };

  // Insert the item into DynamoDB
  dynamoDB.putItem(params, (err, data) => {
    if (err) {
      console.error('Error adding consent to DynamoDB:', err);
    } else {
      console.log('Consent added to DynamoDB:', data);
    }
  });

  consents.push(consents.shift()); // Move the first consent to the end of the array in a cyclic manner
}

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8000;
}

app.listen(port, () => {
  console.log('Server running');

  // Schedule the cyclic consent addition every 24 hours (adjust the interval as needed)
  setInterval(addConsentCyclically, 24 * 60 * 60 * 1000);
});
