const AWS = require("aws-sdk");
const sqs = new AWS.SQS();

export async function notificationService(status, orderDetails, user) {
    try {
        let subject;
        let body;
        const not = await sqs.sendMessage({
            QueueUrl: "https://sqs.us-west-1.amazonaws.com/842557994378/auction-system",
            MessageBody: JSON.stringify({
                subject:'New bid placed!',
                body:`New bid placed... Please check it out!`,
                // recipient: user.email
                recipient: 'anitha.selvanathan@optisolbusiness.com'
            })
        }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(not),
        };
    } catch (ex) {
        return {
            statusCode: 500,
            body: JSON.stringify(ex),
        };
    }
}