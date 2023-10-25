import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'us-west-1' });

export async function sendMail(getUserData) {
  const emailArray = [];
  if(getUserData && getUserData.Items && getUserData.Items.length > 0){
    getUserData.Items.forEach(element => {
          emailArray.push(element.email)
      });
  }
  const params = {
    Source: 'anitha.selvanathan@optisolbusiness.com',
    Destination: {
      ToAddresses: emailArray,
    },
    Message: {
      Body: {
        Text: {
          Data: `New bid placed... Please check it out!`,
        },
      },
      Subject: {
        Data: 'New bid placed!',
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    return result;
  } catch (error) {
    console.error(error);
  }
}
