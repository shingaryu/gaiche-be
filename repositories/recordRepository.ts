AWS.config.update({region:'eu-central-1'});
import * as AWS from 'aws-sdk';
import Record from '../models/Record';

const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.batchWrite = async (ddbItems: Record[]) => {
  let batchItems: Record[] = [];
  for (let i = 0; i < ddbItems.length; i++) {
    batchItems.push(ddbItems[i]);
    // batch process cannot be run more than 25 items
    if (batchItems.length == 25 || i === ddbItems.length - 1) {
      console.log('batch putItem');
      const params = {
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

module.exports.scan = async (filterExpression: string, expressionAttributeValues: any) => {
  const params = {
    TableName : 'EURKakeibo-Records',
    FilterExpression : filterExpression,
    ExpressionAttributeValues : expressionAttributeValues
  };

  return ddb.scan(params).promise();  
}