const jwt = require('jsonwebtoken');
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const JWT_SECRET = "0a6b944d-d2fb-46fc-a85e-0295c986cd9f"

export async function token(user) {
  try {
    const userObj = {
      userId: user.id,
    };
    return jwt.sign(
      {
        iss: 'auction-system-poc', // change issuer name
        sub: userObj,
        iat: new Date().getTime(), // current time
        // exp: new Date().setDate(new Date().getDate() + 1), // current time + 1 day ahead
      },
      JWT_SECRET
    );
  } catch (error) {
    return {
      statusCode: 401,
      message: "Unauthorized",
      body: error
    }
  }
}

export const validateSellerJWTToken = {
  before: async (handler, next) => {
    try {
      if (handler.event.headers.Authorization) {
        const [tokenType, token] = handler.event.headers.Authorization.split(' ');
        if (tokenType.toLowerCase() !== 'jwt') {
          return {
            statusCode: 403,
            message: "Invalid headers"
          }
        } else {
          const decoded = jwt.verify(token, JWT_SECRET);
          const { userId: id } = decoded.sub;
          let result = await dynamodb
            .get({
              TableName: "UsersTable",
              Key: { id }
            })
            .promise();
          const getUserLoginDetail = result.Item;
          if (getUserLoginDetail && getUserLoginDetail.userType === 'seller') {
            handler.event.user = getUserLoginDetail;
          } else {
            return {
              statusCode: 401,
              message: "UNAUTHORIZED"
            }
          }
        }
        next();
      } else {
        return {
          statusCode: 403,
          message: "Access forbidden"
        }
      }
    } catch (error) {
      return {
        statusCode: 401,
        message: "Unauthorized",
        body: error
      }
    }
  }
};

export const validateBuyerJWTToken = {
  before: async (handler, next) => {
    try {
      if (handler.event.headers.Authorization) {
        const [tokenType, token] = handler.event.headers.Authorization.split(' ');
        if (tokenType.toLowerCase() !== 'jwt') {
          return {
            statusCode: 403,
            message: "Invalid headers"
          }
        } else {
          const decoded = jwt.verify(token, JWT_SECRET);
          const { userId: id } = decoded.sub;
          let result = await dynamodb
            .get({
              TableName: "UsersTable",
              Key: { id }
            })
            .promise();
          const getUserLoginDetail = result.Item;
          if (getUserLoginDetail && getUserLoginDetail.userType === 'buyer') {
            handler.event.user = getUserLoginDetail;
          } else {
            return {
              statusCode: 401,
              message: "UNAUTHORIZED"
            }
          }
        }
        next();
      } else {
        return {
          statusCode: 403,
          message: "Access forbidden"
        }
      }
    } catch (error) {
      return {
        statusCode: 401,
        message: "Unauthorized",
        body: error
      }
    }
  }
};
