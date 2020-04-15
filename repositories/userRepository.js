const AWS = require('aws-sdk');
AWS.config.update({region:'eu-central-1'});
const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.getUser = async (userId) => {
  const params = {
    TableName: 'Gaiche-Users',
    Key: {'id': userId}
  };

  return ddb.get(params).promise();
}

module.exports.scan = async (filterExpression, expressionAttributeValues) => {
  const params = {
    TableName : 'Gaiche-Users',
  };

  if (filterExpression) {
    params.FilterExpression = filterExpression;
  }

  if (expressionAttributeValues && Object.keys(expressionAttributeValues).length > 0) {
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  return ddb.scan(params).promise();  
}