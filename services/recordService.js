const csvParser = require('./utils/csvStringToArrays');
const recordRepository = require('../repositories/recordRepository');
const uuidv4 = require('uuid/v4');
const exchangeRates = require('./utils/exchangeRates');

module.exports.postRecordsFromCsv = async (csvType, csvText) => {
  let kakeiboRecords = await csvParser.parseStringToArrays(csvText);
  console.log(kakeiboRecords);

  kakeiboRecords = kakeiboRecords.slice(1); // skip headler row
  let ddbItems = [];
  if (csvType === 'INTESA') {
    ddbItems = intesaRecordsToDdbItems(kakeiboRecords);
  } else if (csvType === 'ZAIM') {
    ddbItems = zaimRecordsToDdbItems(kakeiboRecords);
  } else {
    throw new Error(`csvType ${csvType} is invalid!`);
  }
  await recordRepository.batchWrite(ddbItems);
  return ddbItems;
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
    const timeSeries = timeSeriesFromItems(data.Items, initialAmount);
    return timeSeries;
  } catch (e) {
    console.log(e);
  }
}

module.exports.getTimeSeriesBalanceFromAllCurrencies = async (baseCurrency, initialAmount) => {
  const currencies = ['YEN', 'USD', 'EUR']; // temporarily
  try {
    let allItemsAfterConverted = [];
    for (let currency of currencies) {
      // todo: fetch all ddb items at once and filter internally
      const data = await recordRepository.scan('currency = :target_currency', {':target_currency' : currency});
      const convertedItems = data.Items.map(item => {
        let convertedItem = {...item};
        convertedItem.amount = convertedItem.amount * exchangeRates[baseCurrency][currency];
        convertedItem.currency = baseCurrency;
        return convertedItem;
      })
      console.log(`currency: ${currency}, items: ${convertedItems.length}`);
      allItemsAfterConverted = allItemsAfterConverted.concat(convertedItems);
    }    

    console.log(`all items: ${allItemsAfterConverted.length}`);
    // console.log(allItemsAfterConverted);
    const timeSeries = timeSeriesFromItems(allItemsAfterConverted, initialAmount);
    return timeSeries;
  } catch (e) {
    console.log(e);
  }
}

function timeSeriesFromItems(items, initialAmount) {
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
}