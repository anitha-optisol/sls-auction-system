const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require("middy");
const { validateBuyerJWTToken } = require("../utils/jwtGenerator");
const { notificationService } = require("../services/notification");
const { sendMail } = require("../services/sendMail");

async function placeBid(event, context) {
  try {
    let item;
    const id = v4();
    const now = new Date();
    const { itemId, bid_price } = JSON.parse(event.body);
    const result = await dynamodb
      .get({
        TableName: "ItemsTable",
        Key: { id: itemId },
      })
      .promise();
    item = result.Item;
    if (item) {
      if(item.buyer_id && item.buyer_id !== event.user.id){
        if(bid_price <= item.highest_bid){
          return {
            statusCode: 400,
            message: `Please try to place a bid higher.! Highest bid price is ${item.highest_bid}`,
          };
        }
      }

      const payload = {
        id,
        itemId : itemId,
        bid_price: bid_price,
        buyer_id: event.user.id,
        date: now.toISOString(),
      };
      const placeBid = await dynamodb
        .put({
          TableName: "BidPricesTable",
          Item: payload,
        })
        .promise();
        let responseObject = {
          statusCode: 201,
          body: JSON.stringify(placeBid),

        }
      const updatePayload = {
            TableName: "ItemsTable",
            Key: { id: itemId },
            UpdateExpression: 'set #itemId = :itemId, #highest_bid = :highest_bid,#buyer_id = :buyer_id',
            ExpressionAttributeValues: {
                ':itemId': itemId,
                ':highest_bid': bid_price,
                ':buyer_id': event.user.id
            },
            ExpressionAttributeNames: {
                '#itemId': 'itemId',
                '#highest_bid': 'highest_bid',               
                '#buyer_id': 'buyer_id'               
            },
            ReturnValues: 'ALL_NEW',
        };

        var params = {
          TableName: "UsersTable",
          ExpressionAttributeNames: {
            "#userType": "userType"
          },
          FilterExpression: "#userType=:userType AND id <> :exclude",
          ExpressionAttributeValues: {
            ":userType": 'buyer',
            ":exclude": event.user.id,
          },
        };

        const getUserData = await dynamodb.scan(params).promise();
     
        // const sendMail = await notificationService(getUserData);
        const notifyUsers = await sendMail(getUserData)
        await dynamodb.update(updatePayload).promise();
        if(bid_price > item.highest_bid){
          responseObject.message = 'Highest bid'
        }
      return responseObject;
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

export const handler = middy(placeBid)
                .use(validateBuyerJWTToken)
