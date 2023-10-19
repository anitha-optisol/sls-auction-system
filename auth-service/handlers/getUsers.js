const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require('middy')
const { validateJWTToken } = require('../utils/jwtGenerator')

async function getUsers(event, context) {

  try {
    let UsersTable;
    var params = {
      TableName: "UsersTable",
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
      
    UsersTable = result.Items;
    return {
      statusCode: 200,
      body: JSON.stringify(UsersTable),
    };
  } catch (ex) {
    console.log("catch error==============>>>",ex)
    return {
      statusCode: 500,
      body: JSON.stringify(ex),
    };
  }
}

export const handler = middy(getUsers)
  // .use(validateJWTToken)