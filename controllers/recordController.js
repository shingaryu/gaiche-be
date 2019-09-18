const express = require('express');
const router = express.Router();
const recordService = require('../services/recordService');
const parser = require('../services/utils/multipartParser');
// const event = require('../services/utils/awsLambdaEventMock').intesaCsvEvent;
const event = require('../services/utils/awsLambdaEventMock').zaimCsvEventUtf8;

router.post('/csv', async (req, res) => {
  // currently, only mock object is acceptable!
  const parsedEvent = await parser.parse(event);
  console.log('multipart parser then:');
  console.log(parsedEvent);
  const buff = Buffer.from(parsedEvent.file, 'base64');
  const text = buff.toString();
  console.log('decoded text:');
  console.log(text);

  recordService.postRecordsFromCsv(text);
  res.send('postRecordsFromCsv finished');
});

module.exports = router;