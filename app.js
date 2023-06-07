const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse application/json
app.use(bodyParser.json());

let consents = [];

// Get consent by key
app.get('/consent/:key', (req, res) => {
    const consent = consents.find(c => c.key === req.params.key);
    if (!consent) return res.status(404).send('Consent not found');
    res.send({consent: consent.text});
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

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () => {
 console.log('Server running');
});
