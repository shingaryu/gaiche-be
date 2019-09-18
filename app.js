const express = require('express');
const app = express();

const records = require('./controllers/recordController');

app.get('/', function(req, res) {
  res.send('Welcome to EUR Kakeibo!');
});

app.post('/', function(req, res) {
  console.log(req.body);
  res.send(`Thank you for posting a request to EUR Kakeibo!`);
});

app.listen(8000, function() {
  console.log('Example app listening on port 8000!');
});

app.use('/records', records);
