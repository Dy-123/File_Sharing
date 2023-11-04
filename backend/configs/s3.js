const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: 'ap-south-1',
});

module.exports = s3;