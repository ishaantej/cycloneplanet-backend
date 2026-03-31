const https = require('https');
const fs = require('fs');

const url = "https://news.google.com/rss/search?q=tropical+cyclone&hl=en-US&gl=US&ceid=US:en";

https.get(url, (res) => {
  let data = '';

  console.log("Status:", res.statusCode);

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    try {

      if (!data || data.length < 100) {
        console.log("❌ No data received");
      }

      let titles = [...data.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]);
      let links = [...data.matchAll(/<link>(.*?)<\/link>/g)].map(m => m[1]);

      titles.shift();
      links.shift();

      let articles = [];

      for (let i = 0; i < titles.length; i++) {
        articles.push({
          title: titles[i],
          link: links[i]
        });
      }

      // 🧠 Filter cyclone news
      let filtered = articles.filter(a =>
        a.title.toLowerCase().includes("cyclone") ||
        a.title.toLowerCase().includes("storm") ||
        a.title.toLowerCase().includes("hurricane") ||
        a.title.toLowerCase().includes("typhoon")
      );

      console.log("Found:", filtered.length, "articles");

      let featured = filtered.slice(0, 3);
      let normal = filtered.slice(3, 10);

      let output = {
        lastUpdated: new Date().toISOString().split("T")[0],
        featured: featured,
        articles: normal
      };

      fs.writeFileSync("news.json", JSON.stringify(output, null, 2));

      console.log("✅ news.json updated successfully");

    } catch (err) {
      console.error("❌ Error parsing:", err);
    }
  });

}).on('error', (err) => {
  console.error("❌ Fetch error:", err);
});
