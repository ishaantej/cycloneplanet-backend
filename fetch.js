const https = require('https');
const fs = require('fs');

const url = 'https://www.metoc.navy.mil/jtwc/products/abpwsair.txt';

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    // extract storm names like 99S, 05B
    let matches = data.match(/\d{2}[A-Z]/g) || [];

    let output = {
      storms: matches,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
  });

}).on('error', (err) => {
  console.error(err);
});
