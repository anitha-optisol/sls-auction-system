const AWS = require("aws-sdk");
const sqs = new AWS.SQS();

export async function notificationService(getUserData) {
    try {
        const emailArray = [];
        if(getUserData && getUserData.length > 0){
            getUserData.forEach(element => {
                emailArray.push(element.email)
            });
        }
        let subject;
        let body;
        const not = await sqs.sendMessage({
            QueueUrl: "https://sqs.us-west-1.amazonaws.com/842557994378/auction-system",
            MessageBody: JSON.stringify({
                subject:'New bid placed!',
                body:`New bid placed... Please check it out!`,
                recipient: emailArray
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