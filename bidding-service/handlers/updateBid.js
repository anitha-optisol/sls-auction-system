const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require('middy')
const { validateBuyerJWTToken } = require('../utils/jwtGenerator')

async function updateBid(event, context) {

    try {
        let item;
        const { bid_id, itemId, update_bid_price } = JSON.parse(event.body);
        const result = await dynamodb
          .get({
            TableName: "ItemsTable",
            Key: { id: itemId },
          })
          .promise();
        item = result.Item;
        if (item) {
          if(item.buyer_id && item.buyer_id !== event.user.id){
            if(update_bid_price <= item.highest_bid){
              return {
                statusCode: 400,
                message: `Please try to place a bid higher.! Highest bid price is ${item.highest_bid}`,
              };
            }
          }
          const updatePayload = {
                TableName: "BidPricesTable",
                Key: { id: bid_id },
                UpdateExpression: 'set #itemId = :itemId, #bid_price = :bid_price',
                ExpressionAttributeValues: {
                    ':itemId': itemId,
                    ':bid_price': update_bid_price,
                },
                ExpressionAttributeNames: {
                    '#itemId': 'itemId',
                    '#bid_price': 'bid_price',               
                },
                ReturnValues: 'ALL_NEW',
            };
          await dynamodb.update(updatePayload).promise();
          return {
            statusCode: 200,
            body: JSON.stringify(placeBid),
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

export const handler = middy(updateBid)
  .use(validateBuyerJWTToken)