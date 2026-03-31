console.log("🔥 fetchNews.js is running");
const https = require('https');
const fs = require('fs');

const feeds = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.reutersagency.com/feed/?best-topics=weather&post_type=best"
];

let allArticles = [];

// 📡 Fetch one feed
function fetchFeed(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';

      console.log("Fetching:", url);

      res.on('data', chunk => data += chunk);

      res.on('end', () => {
        try {
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

          resolve(articles);

        } catch {
          resolve([]);
        }
      });

    }).on('error', () => resolve([]));
  });
}

// 🚀 Main function
async function run() {

  for (let feed of feeds) {
    let articles = await fetchFeed(feed);
    allArticles.push(...articles);
  }

  console.log("Total fetched:", allArticles.length);

  // 🧠 FILTER: ANY cyclone-related news
  let filtered = allArticles.filter(a => {
  let t = a.title.toLowerCase();
  return (
    t.includes("cyclone") ||
    t.includes("storm") ||
    t.includes("hurricane") ||
    t.includes("typhoon") ||
    t.includes("weather") ||
    t.includes("rain") ||
    t.includes("flood") ||
    t.includes("wind")
  );
});

  console.log("Filtered:", filtered.length);

  // ⭐ FEATURED (important ones)
  let featured = filtered.filter(a => {
    let t = a.title.toLowerCase();
    return (
      t.includes("warning") ||
      t.includes("landfall") ||
      t.includes("danger") ||
      t.includes("intensifying") ||
      t.includes("alert")
    );
  }).slice(0, 3);

  // 📰 NORMAL ARTICLES
  let normal = filtered.slice(3, 10);

  let output = {
    lastUpdated: new Date().toISOString().split("T")[0],
    featured: featured,
    articles: normal
  };

  fs.writeFileSync("news.json", JSON.stringify(output, null, 2));

  console.log("✅ news.json updated successfully");
}

run();
