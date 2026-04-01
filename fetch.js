const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching real cyclone data...");

// JTWC text data
const url = "https://www.metoc.navy.mil/jtwc/products/abpwweb.txt";

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

    let lines = data.split("\n");

    let storms = [];

    lines.forEach(line => {

      // Example detection (very basic)
      if (line.includes("WARNING")) {

        let nameMatch = line.match(/[0-9]{2}[A-Z]/);

        if (nameMatch) {
          let name = nameMatch[0];

          // ❌ Skip invests (90–99)
          if (name.startsWith("9")) return;

          // 🧠 Dummy coordinates (replace later if needed)
          let lat = Math.random() * 60 - 30;
          let lon = Math.random() * 180 - 90;

          storms.push({
            name: name,
            lat: lat,
            lon: lon,
            warning: "high",
            type: "cyclone"
          });
        }
      }

    });

    let output = {
      lastUpdated: new Date().toISOString(),
      storms: storms
    };

    fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

    console.log("✅ Live cyclones updated:", storms.length);
  });

}).on('error', (err) => {
  console.error("❌ Error:", err);
});
