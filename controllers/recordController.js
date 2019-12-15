const express = require('express');
const router = express.Router();
const recordService = require('../services/recordService');
const parser = require('../services/utils/multipartParser');
// const event = require('../services/utils/awsLambdaEventMock').intesaCsvEvent;
const event = require('../services/utils/awsLambdaEventMock').zaimCsvEventUtf8;

router.post('/csv', async (req, res) => {
  const parsedEvent = await parser.parseHTTPRequest(req);
  // console.log('multipart parser then:');
  console.log(parsedEvent);
  const buff = Buffer.from(parsedEvent.file, 'base64');
  const text = buff.toString();
  // console.log('decoded text:');
  // console.log(text);

  const items = await recordService.postRecordsFromCsv(parsedEvent.csvType, text);
  res.send(items);
});

router.post('/xlsx', async (req, res) => {
  const parsedEvent = await parser.parseHTTPRequest(req);
  const buff = Buffer.from(parsedEvent.file, 'base64');
  const items = await recordService.postRecordsFromXlsx(buff);
  res.send(items);
});

router.get('/analysis/time-series-balance', async (req, res) => {
  const timeSeries = await recordService.getTimeSeriesBalance(req.query.currency, parseFloat(req.query.initialAmount));
  res.send(timeSeries);
});

router.get('/analysis/time-series-balance-all', async (req, res) => {
  // req: base currency and initial amount
  const timeSeries = await recordService.getTimeSeriesBalanceFromAllCurrencies(req.query.baseCurrency, parseFloat(req.query.initialAmount));
  res.send(timeSeries);
});

module.exports = router;