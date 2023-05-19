const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Configure CSV writer
const csvWriter = createCsvWriter({
  path: 'output.csv',
  header: [
    { id: 'fileName', title: 'file_name' },
    { id: 'isBlur', title: 'is_blur' },
    { id: 'blurValue', title: 'blur_value' },
  ],
});

// Function to upload file content to the server using the API
async function uploadFileContent(fileName) {
  try {
    // Make the API request to upload the file content
    const response = await axios.post('http://10.30.82.63:8080/computer-vision/detect-blur', {
      imageFile: fs.createReadStream(`download/${fileName}`),
    }, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log(`Uploaded ${fileName} successfully`);

    // Extract required data
    const { isBlur, blurValue } = response.data;

    // Write the extracted data to CSV
    csvWriter.writeRecords([{ fileName, isBlur, blurValue }]);
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error.message);
  }
}

// Read the CSV file and process each file name
fs.createReadStream('input.csv')
  .pipe(csv())
  .on('data', (row) => {
    const fileName = row.fileName;
    uploadFileContent(fileName);
  })
  .on('end', () => {
    console.log('CSV processing completed.');
  });
