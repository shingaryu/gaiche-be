const analysis = require('./analysis');

asyncMain();

async function asyncMain() {
// const express = require('express');
// const app = express();

// app.get('/', function(req, res) {
//   res.send('Hello World!');
// });

// app.post('/', function(req, res) {
//   console.log(req.body);
//   res.send(`hello`);
// });

// app.listen(8000, function() {
//   console.log('Example app listening on port 8000!');
// });

  const timeSeries = await analysis.timeSeriesBalance('YEN', 0);
  console.log(timeSeries);
}