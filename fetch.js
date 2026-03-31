const https = require('https');
const fs = require('fs');

const url = 'https://www.metoc.navy.mil/jtwc/products/abpwsair.txt';

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

    let storms = [];

    // Match storm IDs like 99S, 05B, 12W etc.
    let matches = data.match(/\b\d{2}[A-Z]\b/g);

    if (matches) {
      // Remove duplicates
      storms = [...new Set(matches)];
    }

    let output = {
      storms: storms,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
  });

}).on('error', (err) => {
  console.error(err);
});
