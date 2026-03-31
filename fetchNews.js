const https = require('https');
const fs = require('fs');

const feeds = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.reutersagency.com/feed/?best-topics=weather&post_type=best"
];

let allArticles = [];

function fetchFeed(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);

      res.on('end', () => {
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
      });

    }).on('error', () => resolve([]));
  });
}

async function run() {

  for (let feed of feeds) {
    let articles = await fetchFeed(feed);
    allArticles.push(...articles);
  }

  // 🧠 FILTER storm-related news
  let filtered = allArticles.filter(a => {
    let t = a.title.toLowerCase();
    return (
      t.includes("cyclone") ||
      t.includes("storm") ||
      t.includes("hurricane") ||
      t.includes("typhoon")
    );
  });

  console.log("Total found:", filtered.length);

  // ⭐ FEATURED (important ones)
  let featured = filtered.filter(a => {
    let t = a.title.toLowerCase();
    return (
      t.includes("warning") ||
      t.includes("landfall") ||
      t.includes("intensifying") ||
      t.includes("danger")
    );
  }).slice(0, 3);

  // 📰 NORMAL
  let normal = filtered.slice(3, 10);

  let output = {
    lastUpdated: new Date().toISOString().split("T")[0],
    featured: featured,
    articles: normal
  };

  fs.writeFileSync("news.json", JSON.stringify(output, null, 2));

  console.log("✅ news.json updated");
}

run();
