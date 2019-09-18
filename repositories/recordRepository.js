const AWS = require('aws-sdk');
AWS.config.update({region:'eu-central-1'});
const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.batchWrite = async (ddbItems) => {
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
}

module.exports.scan = async (filterExpression, expressionAttributeValues) => {
  const params = {
    TableName : 'EURKakeibo-Records',
    FilterExpression : filterExpression,
    ExpressionAttributeValues : expressionAttributeValues
  };

  return ddb.scan(params).promise();  
}