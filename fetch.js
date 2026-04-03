const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching JTWC data...");

const sources = [
  "https://www.metoc.navy.mil/jtwc/products/abpwweb.txt", // Pacific
  "https://www.metoc.navy.mil/jtwc/products/abioweb.txt"  // Indian Ocean
];

let storms = [];

function fetchSource(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let data = '';

      res.on('data', chunk => data += chunk);

      res.on('end', () => {
        let lines = data.split("\n");

        let currentStorm = null;

        lines.forEach(line => {

          // 🧠 Detect storm ID (01W, 02B etc)
          let idMatch = line.match(/\b\d{2}[A-Z]\b/);

          if (idMatch && line.includes("WARNING")) {
            let id = idMatch[0];

            // ❌ Skip invests (90–99)
            if (id.startsWith("9")) return;

            currentStorm = {
              name: id,
              lat: null,
              lon: null,
              warning: "high",
              type: "cyclone"
            };

            storms.push(currentStorm);
          }

          // 📍 Coordinates
          let coordMatch = line.match(/(\d{1,2}\.\d)([NS])\s+(\d{1,3}\.\d)([EW])/);

          if (coordMatch && currentStorm) {
            let lat = parseFloat(coordMatch[1]);
            let lon = parseFloat(coordMatch[3]);

            if (coordMatch[2] === "S") lat = -lat;
            if (coordMatch[4] === "W") lon = -lon;

            currentStorm.lat = lat;
            currentStorm.lon = lon;
          }

        });

        resolve();
      });

    }).on('error', () => resolve());
  });
}

async function run() {

  for (let src of sources) {
    await fetchSource(src);
  }

  // ❌ Remove storms without coords
  storms = storms.filter(s => s.lat !== null && s.lon !== null);

  let output = {
    lastUpdated: new Date().toISOString(),
    storms: storms
  };

  fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

  console.log("✅ Cyclones found:", storms.length);
}

run();
