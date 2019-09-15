const AWS = require('aws-sdk');
AWS.config.update({region:'eu-central-1'});
const ddb = new AWS.DynamoDB.DocumentClient();

async function timeSeriesBalance(currency, initialAmount) {
  const params = {
    TableName : 'EURKakeibo-Records',
    FilterExpression : 'currency = :target_currency',
    ExpressionAttributeValues : {':target_currency' : currency}
  };
 
  try {
    const data = await ddb.scan(params).promise();
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

module.exports.timeSeriesBalance = timeSeriesBalance;