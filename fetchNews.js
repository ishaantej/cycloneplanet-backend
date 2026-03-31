const https = require('https');
const fs = require('fs');

const url = "https://feeds.bbci.co.uk/news/world/rss.xml";

console.log("🔥 fetchNews.js is running");

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    console.log("Data length:", data.length);

    // 🧠 Simple split method (more reliable)
    let items = data.split("<item>").slice(1);

    let articles = [];

    items.forEach(item => {
      let titleMatch = item.match(/<title>(.*?)<\/title>/);
      let linkMatch = item.match(/<link>(.*?)<\/link>/);

      if (titleMatch && linkMatch) {
        articles.push({
          title: titleMatch[1],
          link: linkMatch[1]
        });
      }
    });

    console.log("Extracted:", articles.length);

    // ❗ DO NOT FILTER (for now)
    let featured = articles.slice(0, 3);
    let normal = articles.slice(3, 10);

    let output = {
      lastUpdated: new Date().toISOString().split("T")[0],
      featured: featured,
      articles: normal
    };

    fs.writeFileSync("news.json", JSON.stringify(output, null, 2));

    console.log("✅ news.json UPDATED WITH REAL DATA");
  });

}).on('error', (err) => {
  console.error("❌ Fetch error:", err);
});
