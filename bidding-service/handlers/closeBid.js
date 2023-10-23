const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require('middy')
const { validateSellerJWTToken } = require('../utils/jwtGenerator')

async function closeBid(event, context) {

    try {
        let item;
        const { itemId, status } = JSON.parse(event.body);
        const result = await dynamodb
          .get({
            TableName: "ItemsTable",
            Key: { id: itemId },
          })
          .promise();
        item = result.Item;
        if (item) {
    
          const updatePayload = {
                TableName: "ItemsTable",
                Key: { id: itemId },
                UpdateExpression: 'set #status = :status',
                ExpressionAttributeValues: {
                    ':status': status,
                },
                ExpressionAttributeNames: {
                    '#status': 'status',
                },
                ReturnValues: 'ALL_NEW',
            };
          await dynamodb.update(updatePayload).promise();
          return {
            statusCode: 200,
            body: JSON.stringify(result),
          };
        } else {
          return {
            statusCode: 204,
            message: "No content",
            body: "No content",
          };
        }
    } catch (ex) {
        return {
            statusCode: 500,
            body: JSON.stringify(ex),
        };
    }
}

export const handler = middy(closeBid)
  .use(validateSellerJWTToken)