const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();

// parse application/json
app.use(bodyParser.json());

// Configure AWS credentials and region
AWS.config.update({
  accessKeyId: 'ASIAQDSB7LRV6DVIG4MO',
  secretAccessKey: '/TKyXfhyda21YS8xXSXgz5ZOG+95/zkNJ/F7cu4y',
  region: 'eu-west-2'
});

const dynamoDB = new AWS.DynamoDB();

// Get consent by key
app.get('/consent/:key', (req, res) => {
  const params = {
    TableName: 'your_table_name',
    Key: {
      key: { S: req.params.key }
    }
  };

  dynamoDB.getItem(params, (err, data) => {
    if (err) {
      console.error('Error retrieving consent:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (data.Item) {
        res.send({ consent: data.Item.text.S });
      } else {
        res.status(404).send('Consent not found');
      }
    }
  });
});

// Create a new consent
app.post('/consent', (req, res) => {
  const params = {
    TableName: 'your_table_name',
    Item: {
      key: { S: req.body.key },
      text: { S: req.body.text }
    }
  };

  dynamoDB.putItem(params, (err, data) => {
    if (err) {
      console.error('Error creating consent:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).send(params.Item);
    }
  });
});

// Update a consent
app.put('/consent/:key', (req, res) => {
  const params = {
    TableName: 'your_table_name',
    Key: {
      key: { S: req.params.key }
    },
    UpdateExpression: 'SET #text = :text',
    ExpressionAttributeNames: { '#text': 'text' },
    ExpressionAttributeValues: { ':text': { S: req.body.text } }
  };

  dynamoDB.updateItem(params, (err, data) => {
    if (err) {
      console.error('Error updating consent:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (data.Attributes) {
        res.send(data.Attributes);
      } else {
        res.status(404).send('Consent not found');
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 8000;
}

app.listen(port, () => {
  console.log('Server running');
});
