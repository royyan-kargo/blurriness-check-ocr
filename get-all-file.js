require('dotenv').config()
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Configure AWS credentials
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  // region: 'YOUR_REGION'
});

// Create an S3 service object
const s3 = new AWS.S3();

// Set the bucket name
const bucketName = 'kg-prd-load-service-pod';

// Set the path to the CSV file
const csvFilePath = 'input.csv';

// Read the CSV file and download each file listed
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', function(row) {
    // Extract the file name from the CSV row (assuming the column name is 'fileName')
    const fileName = row.fileName;

    // Construct the file key and local file path
    const fileKey = fileName; // Modify this based on your file key pattern in the bucket
    const fileExtension = path.extname(fileKey);
    const randomFileName = Math.random().toString(36).substring(7);
    const localFilePath = `./download/${row.fileName}`;

    // Create a stream to write the downloaded file
    const fileStream = fs.createWriteStream(localFilePath);

    // Create the parameters for the getObject method
    const params = {
      Bucket: bucketName,
      Key: fileKey
    };

    // Download the file from the S3 bucket
    const download = s3.getObject(params).createReadStream().pipe(fileStream);

    // Handle success and error events for each file
    download.on('error', function(err) {
      console.error(`Error downloading file '${fileKey}':`, err);
    });

    download.on('finish', function() {
      console.log(`File '${fileKey}' downloaded successfully!`);
    });
  })
  .on('end', function() {
    console.log('All files downloaded!');
  });
