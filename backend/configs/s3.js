const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION || 'ap-south-1',
    // Useful for LocalStack
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: !!process.env.S3_ENDPOINT
});

module.exports = s3;