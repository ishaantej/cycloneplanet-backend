const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching JTWC RSS...");

// JTWC RSS feed
const url = "https://www.metoc.navy.mil/jtwc/rss.xml";

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

    let items = data.split("<item>").slice(1);

    let storms = [];

    items.forEach(item => {

      let titleMatch = item.match(/<title>(.*?)<\/title>/);
      let descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

      if (titleMatch && descMatch) {

        let title = titleMatch[1];
        let desc = descMatch[1];

        // ❌ Skip "No Active"
        if (title.includes("No Active")) return;

        // 🧠 Extract storm ID
        let idMatch = title.match(/\d{2}[A-Z]/);

        if (!idMatch) return;

        let id = idMatch[0];

        // ❌ Skip invests
        if (id.startsWith("9")) return;

        // 📍 Extract coordinates from description
        let coordMatch = desc.match(/(\d{1,2}\.\d)([NS])\s+(\d{1,3}\.\d)([EW])/);

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
      }
    });

    let output = {
      lastUpdated: new Date().toISOString(),
      storms: storms
    };

    fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

    console.log("✅ Storms found:", storms.length);
  });

}).on('error', (err) => {
  console.error("❌ Error:", err);
});const https = require('https');
const fs = require('fs');

console.log("🌪️ Fetching JTWC RSS...");

// JTWC RSS feed
const url = "https://www.metoc.navy.mil/jtwc/rss.xml";

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

    let items = data.split("<item>").slice(1);

    let storms = [];

    items.forEach(item => {

      let titleMatch = item.match(/<title>(.*?)<\/title>/);
      let descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

      if (titleMatch && descMatch) {

        let title = titleMatch[1];
        let desc = descMatch[1];

        // ❌ Skip "No Active"
        if (title.includes("No Active")) return;

        // 🧠 Extract storm ID
        let idMatch = title.match(/\d{2}[A-Z]/);

        if (!idMatch) return;

        let id = idMatch[0];

        // ❌ Skip invests
        if (id.startsWith("9")) return;

        // 📍 Extract coordinates from description
        let coordMatch = desc.match(/(\d{1,2}\.\d)([NS])\s+(\d{1,3}\.\d)([EW])/);

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
      }
    });

    let output = {
      lastUpdated: new Date().toISOString(),
      storms: storms
    };

    fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

    console.log("✅ Storms found:", storms.length);
  });

}).on('error', (err) => {
  console.error("❌ Error:", err);
});
