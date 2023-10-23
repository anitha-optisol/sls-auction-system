const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require('middy')

async function getItems(event, context) {

  try {
    let ItemsTable;
    var params = {
      TableName: "ItemsTable",
      ExpressionAttributeNames: {
        "#isDeleted": "isDeleted"
      },
      ExpressionAttributeValues: {
        ":isDeletedValue": false,
      },
      FilterExpression: "#isDeleted=:isDeletedValue",
    };
    const result = await dynamodb
      .scan(params)
      .promise();

    ItemsTable = result.Items;
    return {
      statusCode: 200,
      body: JSON.stringify(ItemsTable),
    };
  } catch (ex) {
    return {
      statusCode: 500,
      body: JSON.stringify(ex),
    };
  }
}

export const handler = middy(getItems)