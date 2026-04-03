const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching cyclone data...");

const url = "https://www.metoc.navy.mil/jtwc/rss.xml";

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    try {

      let storms = [];

      if (data.includes("<item>")) {

        let items = data.split("<item>").slice(1);

        items.forEach(item => {

          let titleMatch = item.match(/<title>(.*?)<\/title>/);
          let descMatch = item.match(/<!\[CDATA\[(.*?)\]\]>/);

          if (!titleMatch || !descMatch) return;

          let title = titleMatch[1];

          // ❌ Skip no active
          if (title.includes("No Active")) return;

          let idMatch = title.match(/\d{2}[A-Z]/);
          if (!idMatch) return;

          let id = idMatch[0];

          // ❌ Skip invests
          if (id.startsWith("9")) return;

          let coordMatch = descMatch[1].match(/(\d{1,2}\.\d)([NS])\s+(\d{1,3}\.\d)([EW])/);

          if (!coordMatch) return;

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
        });
      }

      let output = {
        lastUpdated: new Date().toISOString(),
        storms: storms
      };

      fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

      console.log("✅ Completed safely. Storms:", storms.length);

    } catch (err) {
      console.log("⚠️ Parsing error, but continuing...");
    }
  });

}).on('error', (err) => {
  console.log("⚠️ Fetch failed, writing empty data...");

  fs.writeFileSync("data.json", JSON.stringify({
    lastUpdated: new Date().toISOString(),
    storms: []
  }, null, 2));
});
