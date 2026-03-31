const https = require('https');
const fs = require('fs');

const url = "https://www.sciencedaily.com/rss/earth_climate/hurricanes_and_cyclones.xml";

console.log("🔥 fetchNews.js running (ScienceDaily)");

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

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

    console.log("Cyclone articles found:", articles.length);

    // ⭐ Featured (top research headlines)
    let featured = articles.slice(0, 3);

    // 📰 Rest
    let normal = articles.slice(3, 10);

    let output = {
      lastUpdated: new Date().toISOString().split("T")[0],
      featured: featured,
      articles: normal
    };

    fs.writeFileSync("news.json", JSON.stringify(output, null, 2));

    console.log("✅ news.json updated with REAL cyclone research news");
  });

}).on('error', (err) => {
  console.error("❌ Error:", err);
});
