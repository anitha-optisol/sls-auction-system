const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { passwordEncryption } = require("../utils/passwordEncryptor");
const { token } = require("../utils/jwtGenerator");
async function login(event, context) {

  try {
    const { password, email } = JSON.parse(event.body);
    const incrypt_password = await passwordEncryption(password);
    var params = {
      TableName: "UsersTable",
      ExpressionAttributeNames: {
        "#password": "password",
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":emailValue": email,
        ":passwordValue": incrypt_password,
      },
      FilterExpression: "#password = :passwordValue and #email=:emailValue",
    };
    const result = await dynamodb
      .scan(params)
      .promise();
      console.log("result========>>>",result)
    if (result.Items.length > 0) {
      const userDetail = result.Items[0];
      const loginToken = await token(result.Items[0])
      const response = {
        userDetail,
        loginToken
      }
      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    } else {
      const message = 'Please register to login'
      return {
        statusCode: 401,
        body: JSON.stringify(message)
      };
    }
  } catch (ex) {
    console.log("result ex========>>>",ex)
    return {
      statusCode: 500,
      body: ex
    };
  }
}

export const handler = login;