const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching JTWC cyclones...");

const sources = [
  "https://www.metoc.navy.mil/jtwc/products/abpwweb.txt",
  "https://www.metoc.navy.mil/jtwc/products/abioweb.txt"
];

let storms = [];

function fetchSource(url) {
  return new Promise(resolve => {

    https.get(url, res => {
      let data = '';

      res.on('data', chunk => data += chunk);

      res.on('end', () => {

        let lines = data.split("\n");

        for (let i = 0; i < lines.length; i++) {

          let line = lines[i];

          // 🧠 Detect storm ID (01B, 02W, etc)
          let idMatch = line.match(/\b\d{2}[A-Z]\b/);

          if (idMatch) {
            let id = idMatch[0];

            // ❌ Skip invests
            if (id.startsWith("9")) continue;

            // 🔍 Look ahead for coordinates
            for (let j = i; j < i + 10; j++) {

              let coordLine = lines[j];

              let coordMatch = coordLine.match(/(\d{1,2}\.\d)([NS])\s+(\d{1,3}\.\d)([EW])/);

              if (coordMatch) {

                let lat = parseFloat(coordMatch[1]);
                let lon = parseFloat(coordMatch[3]);

                if (coordMatch[2] === "S") lat = -lat;
                if (coordMatch[4] === "W") lon = -lon;

                storms.push({
                  name: id,
                  lat: lat,
                  lon: lon,
                  warning: "high",
                  type: "cyclone"
                });

                break; // stop searching for this storm
              }
            }
          }
        }

        resolve();
      });

    }).on('error', () => resolve());
  });
}

async function run() {

  for (let src of sources) {
    await fetchSource(src);
  }

  let output = {
    lastUpdated: new Date().toISOString(),
    storms: storms
  };

  fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

  console.log("✅ Storms found:", storms.length);
}

run();
