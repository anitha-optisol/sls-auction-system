const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const middy = require('middy')
const { validateJWTToken } = require('../utils/jwtGenerator')

async function getUserById(event, context) {

    try {
        let user;
        const { id } = event.pathParameters;
        const result = await dynamodb
            .get({
                TableName: "UsersTable",
                Key: { id }
            })
            .promise();
        user = JSON.stringify(result.Item);
        if (user) {
            return {
                statusCode: 200,
                body: user,
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

export const handler = middy(getUserById)
//   .use(validateJWTToken)