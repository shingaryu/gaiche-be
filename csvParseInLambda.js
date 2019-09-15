const parser = require('./multipartParser');
// const event = require('./awsLambdaEventMock').intesaCsvEvent;
const event = require('./awsLambdaEventMock').zaimCsvEventUtf8;
const csvParser = require('./csvStringToArrays');

const AWS = require('aws-sdk');
AWS.config.update({region:'eu-central-1'});
const ddb = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');

asyncMain();

async function asyncMain() {
  try {
    // test for multipart parser
    const parsedEvent = await parser.parse(event);
    console.log('multipart parser then:');
    console.log(parsedEvent);
    const buff = Buffer.from(parsedEvent.file, 'base64');
    const text = buff.toString();
    console.log('decoded text:');
    console.log(text);

    // test for csv parser
    let kakeiboRecords = await csvParser.parseStringToArrays(text);
    console.log(kakeiboRecords);

    kakeiboRecords = kakeiboRecords.slice(1); // skip headler row

    // test for DynamoDB
    // const ddbItems = intesaRecordsToDdbItems(kakeiboRecords);
    const ddbItems = zaimRecordsToDdbItems(kakeiboRecords);
    let batchItems = [];
    for (let i = 0; i < ddbItems.length; i++) {
      batchItems.push(ddbItems[i]);
      // batch process cannot be run more than 25 items
      if (batchItems.length == 25 || i === ddbItems.length - 1) {
        console.log('batch putItem');
        var params = {
          RequestItems: {
            'EURKakeibo-Records': 
            batchItems.map(item => {          
              return {
                PutRequest: {
                  Item: item       
                }
              } 
            })
          }
        };

        const ddbResponse = await ddb.batchWrite(params).promise();
        console.log(ddbResponse);

        batchItems = [];
      }
    }

  } catch (e) {
    console.log(e);
  }
}

// each row item will be single dynamoDB item
function intesaRecordsToDdbItems(records) {
  ddbItems = [];

  records.forEach(record => {
    const amount = parseFloat(record[7]);

    const item = {
      id: uuidv4(),
      userId: null,
      date: record[0],
      transactionCategory: amount > 0 ? 1 : 0,
      transactionFrom: 'INTESA SANPAOLO',
      transactionTo: null,
      amount: amount,
      currency: 'EUR',
      category1: record[5],
      category2: null,
      shop: record[1],
      memo: null
    }        
    
    ddbItems.push(item);
  })

  return ddbItems;
}

// each row item will be single dynamoDB item
function zaimRecordsToDdbItems(records) {
  ddbItems = [];

  records.forEach(record => {
    let transactionCategory = 0;
    if (record[1] === 'payment') {
      transactionCategory = 0;
    } else if (record[1] === 'income') {
      transactionCategory = 1;
    } else if (record[1] === 'transfer') {
      transactionCategory = 2;
    } else { // balance, or other invalid labels 
      return;
    }

    const amount = transactionCategory === 0 ? record[11] : transactionCategory === 1 ? record[10] : transactionCategory === 2 ? record[12] : record[13];

    const item = {
      id: uuidv4(),
      userId: null,
      date: record[0],
      transactionCategory: transactionCategory,
      transactionFrom: record[4],
      transactionTo: record[5],
      amount: amount,
      currency: 'YEN',
      category1: record[2],
      category2: record[3],
      shop: record[8],
      memo: null
    }        
    
    ddbItems.push(item);
  })

  return ddbItems;
}



