const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require('middy')
const { validateJWTToken } = require('../utils/jwtGenerator')

async function addItem(event, context) {

  try {
    const { itemId, itemName, price, status } = JSON.parse(event.body);
    const id = v4();
    const now = new Date();
    const payload = {
      id,
      itemId,
      itemName,
      price,
      status,
      isDeleted: false,
      highest_bid: '',
      buyer_id: '',
      date: now.toISOString(),
    };
    const result = await dynamodb
      .put({
        TableName: "ItemsTable",
        Item: payload,
      })
      .promise();

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  } catch (ex) {
    return {
      statusCode: 500,
      body: JSON.stringify(ex),
    };
  }
}

export const handler = middy(addItem)
  // .use(validateJWTToken)