import express from 'express';
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
