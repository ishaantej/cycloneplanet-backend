const https = require('https');
const fs = require('fs');

const url = "https://news.google.com/rss/search?q=tropical+cyclone+OR+typhoon+OR+hurricane&hl=en-US&gl=US&ceid=US:en";

https.get(url, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {

    let titles = [...data.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]);
    let links = [...data.matchAll(/<link>(.*?)<\/link>/g)].map(m => m[1]);

    // remove first item (it's just feed title)
    titles.shift();
    links.shift();

    let articles = [];

    for (let i = 0; i < titles.length; i++) {
      articles.push({
        title: titles[i],
        link: links[i]
      });
    }

    // 🧠 Filter only relevant storm news
    let filtered = articles.filter(a =>
      a.title.toLowerCase().includes("storm") ||
      a.title.toLowerCase().includes("cyclone") ||
      a.title.toLowerCase().includes("hurricane") ||
      a.title.toLowerCase().includes("typhoon")
    );

    // ⭐ Pick featured (most "interesting")
    let featured = [];
    let normal = [];

    filtered.forEach(a => {
      let title = a.title.toLowerCase();

      if (
        title.includes("warning") ||
        title.includes("developing") ||
        title.includes("landfall") ||
        title.includes("danger") ||
        title.includes("intensifying")
      ) {
        featured.push(a);
      } else {
        normal.push(a);
      }
    });

    // limit featured to top 3
    featured = featured.slice(0, 3);

    let output = {
      lastUpdated: new Date().toISOString().split("T")[0],
      featured: featured,
      articles: normal.slice(0, 10)
    };

    fs.writeFileSync("news.json", JSON.stringify(output, null, 2));

    console.log("✅ news.json updated");
  });

}).on('error', (err) => {
  console.error("❌ Fetch error:", err);
});
