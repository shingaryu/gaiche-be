const csvParser = require('./utils/csvStringToArrays');
const recordRepository = require('../repositories/recordRepository');
const uuidv4 = require('uuid/v4');

module.exports.postRecordsFromCsv = async (file) => {
  // file is supporsed to be plain text after decoded from Base64
  let kakeiboRecords = await csvParser.parseStringToArrays(file);
  console.log(kakeiboRecords);

  kakeiboRecords = kakeiboRecords.slice(1); // skip headler row
  // const ddbItems = intesaRecordsToDdbItems(kakeiboRecords);
  const ddbItems = zaimRecordsToDdbItems(kakeiboRecords);
  recordRepository.batchWrite(ddbItems);
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
      amount: Math.abs(amount),
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
      amount: parseFloat(amount),
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

module.exports.getTimeSeriesBalance = async (currency, initialAmount) => {
  try {
    const data = await recordRepository.scan('currency = :target_currency', {':target_currency' : currency})

    // console.log(data);
    const items = data.Items;
    items.sort((a, b) => {
      const aDate = Date.parse(a.date);
      const bDate = Date.parse(b.date);
      if (aDate < bDate) {
        return -1;
      } else if (bDate < aDate) {
        return 1;
      } else {
        return 0;
      }
    });

    const timeSeries = [];
    let currentDate = null;
    let currentBalance = initialAmount;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (currentDate !== item.date && i !== 0) {
        timeSeries.push({date: currentDate, balance: currentBalance});
      }

      currentDate = item.date;
      if (item.transactionCategory === 0) { // payment
        currentBalance -= item.amount;
      } else if (item.transactionCategory === 1) { // income
        currentBalance += item.amount
      } else { // transfer
        currentBalance += 0; // not changed totally
      }
    }

    if (currentDate) {
      timeSeries.push({date: currentDate, balance: currentBalance});
    }

    return timeSeries;
  } catch (e) {
    console.log(e);
  }
}