const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching real cyclone data with coordinates...");

const url = "https://www.metoc.navy.mil/jtwc/products/abpwweb.txt";

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

    let lines = data.split("\n");

    let storms = [];
    let currentStorm = null;

    lines.forEach(line => {

      // 🧠 Detect storm ID (like 01S, 05B)
      let nameMatch = line.match(/\b\d{2}[A-Z]\b/);

      if (nameMatch && line.includes("WARNING")) {
        let name = nameMatch[0];

        // ❌ Skip invests (90–99)
        if (name.startsWith("9")) return;

        currentStorm = {
          name: name,
          lat: null,
          lon: null,
          warning: "high",
          type: "cyclone"
        };

        storms.push(currentStorm);
      }

      // 📍 Extract coordinates
      let coordMatch = line.match(/(\d{1,2}\.\d)([NS])\s+(\d{1,3}\.\d)([EW])/);

      if (coordMatch && currentStorm) {
        let lat = parseFloat(coordMatch[1]);
        let lon = parseFloat(coordMatch[3]);

        // Convert N/S
        if (coordMatch[2] === "S") lat = -lat;

        // Convert E/W
        if (coordMatch[4] === "W") lon = -lon;

        currentStorm.lat = lat;
        currentStorm.lon = lon;
      }

    });

    // ❌ Remove storms without coordinates
    storms = storms.filter(s => s.lat !== null && s.lon !== null);

    let output = {
      lastUpdated: new Date().toISOString(),
      storms: storms
    };

    fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

    console.log("✅ Cyclones with real coordinates:", storms.length);
  });

}).on('error', (err) => {
  console.error("❌ Error:", err);
});
