const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const {passwordEncryption} = require("../utils/passwordEncryptor");
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function register(event, context) {

  try {
    const { name, email, mobileNumber,password, isDeleted, isActive, userType } = JSON.parse(event.body);
    const id = v4();
    const now = new Date();
    const incrypt_password = await passwordEncryption(password);
    const payload = {
      id,
      name,
      email,
      mobileNumber,
      isDeleted,
      isActive,
      userType,
      password: incrypt_password,
      date: now.toISOString(),
    };
    const result = await dynamodb
    .put({
      TableName: "UsersTable",
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

export const handler = register;