import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch news content from URL
  app.post("/api/fetch-news", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(response.data);
      
      // Basic extraction logic
      let title = $("h1").first().text().trim() || $("title").text().trim();
      
      // Remove unnecessary elements
      $("script, style, nav, footer, iframe, ads").remove();
      
      // Try to find the article body first
      let articleContent = $("article").text().trim();
      if (!articleContent || articleContent.length < 200) {
        // Fallback to div with common article classes or just all paragraphs
        articleContent = $(".article-body, .content, .main-content, #main-article, .post-content, .entry-content").text().trim();
      }
      if (!articleContent || articleContent.length < 200) {
         articleContent = $("p").map((i, el) => $(el).text()).get().join("\n");
      }

      const content = articleContent.slice(0, 8000).trim();

      if (!content) {
        return res.status(422).json({ error: "Could not extract meaningful content from this URL" });
      }

      res.json({ title, content });
    } catch (error: any) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ error: "Failed to fetch or parse news content. The site might be blocking automated access." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
