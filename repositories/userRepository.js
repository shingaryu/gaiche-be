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