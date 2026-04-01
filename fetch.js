const fs = require('fs');

console.log("🔥 fetch.js running");

// 🧠 NO DATA YET (waiting for real source)
let storms = [];

// 📦 OUTPUT STRUCTURE
let output = {
  lastUpdated: new Date().toISOString(),
  storms: storms
};

// 💾 WRITE FILE
fs.writeFileSync("data.json", JSON.stringify(output, null, 2));

console.log("✅ data.json updated (currently empty)");
