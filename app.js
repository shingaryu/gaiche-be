const express = require('express');
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const records = require('./controllers/recordController');

app.get('/', function(req, res) {
  res.send('Welcome to Gaiche!');
});

app.post('/', function(req, res) {
  console.log(req.body);
  res.send(`Thank you for posting a request to Gaiche!`);
});

app.listen(8000, function() {
  console.log('Example app listening on port 8000!');
});

app.use('/records', records);
