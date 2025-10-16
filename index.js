// const express = require('express');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors());

// app.get('/api/stock-info/:ticker', async (req, res) => {
//   const { ticker } = req.params;

//   try {
//     const url = `https://dps.psx.com.pk/company/${ticker}`;
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);

//     // Extract name & sector safely
//     const name = $('h1.company-name').first().text().trim() || null;
//     const industry = $('span.sector').first().text().trim() || null;

//     // Extract closing price safely
//     let priceText = $('div.stock-price').first().text().trim() || null; // Update selector
//     let closingPrice = null;
//     if (priceText) {
//       // Remove any currency symbols, commas
//       closingPrice = Number(priceText.replace(/[^\d.]/g, ''));
//       if (isNaN(closingPrice)) closingPrice = null;
//     }

//     // Optional: change % and value (if available)
//     let changePercent = $('div.change-percent').first().text().trim() || null;
//     let changeValueText = $('div.change-value').first().text().trim() || null;
//     let changeValue = changeValueText ? Number(changeValueText.replace(/[^\d.-]/g, '')) : null;

//     res.json({
//       ticker,
//       name,
//       industry,
//       closingPrice,
//       changePercent,
//       changeValue,
//       timestamp: new Date()
//     });
//   } catch (err) {
//     console.error(`Error fetching data for ${ticker}:`, err.message);
//     res.status(500).json({ error: 'Failed to fetch data', details: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });

// // index.js
// const express = require('express');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors());

// // In-memory cache
// const cache = {};
// const CACHE_DURATION = 5 * 60 * 1000; // minutes

// app.get('/api/stock-info/:ticker', async (req, res) => {
//   const { ticker } = req.params;
//   const upperTicker = ticker.toUpperCase();

//   // Return cached data if valid
//   if (cache[upperTicker] && (Date.now() - cache[upperTicker].timestamp < CACHE_DURATION)) {
//     return res.json(cache[upperTicker].data);
//   }

//   try {
//     const url = `https://dps.psx.com.pk/company/${upperTicker}`;
//     const response = await axios.get(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
//       },
//       timeout: 5000, // 5 seconds timeout
//     });

//     const $ = cheerio.load(response.data);

//     const name = $('div.quote__name').text().trim() || null;
//     const industry = $('div.quote__sector').text().trim() || null;

//     // let priceText = $('div.quote__close').text().trim(); // e.g. "PKR 123.45"
//     // let closingPrice = null;
//     // if (priceText) {
//     //   closingPrice = Number(priceText.replace(/[^0-9.]/g, ""));
//     //   if (isNaN(closingPrice)) closingPrice = null;
//     // }
//     // Try multiple selectors to handle PSX layout changes
//     // --- Improved robust price extraction ---
//   let priceText =
//     $('div.quote__close').text().trim() ||
//     $('div.quote__price').text().trim() ||
//     $('span#quote-close').text().trim() ||
//     $('span.quote__value').text().trim() ||
//     $('div.quote span.value').first().text().trim();

//   let closingPrice = null;

//   if (priceText) {
//     // Remove PKR, commas, non-breaking spaces, etc.
//     let numeric = priceText
//       .replace(/PKR/gi, "")
//       .replace(/[,\s\xa0]/g, "")
//       .trim();

//     // Now match digits properly
//     const match = numeric.match(/(\d+(\.\d+)?)/);
//     if (match) {
//       closingPrice = parseFloat(match[1]);
//     } else {
//       closingPrice = null;
//     }
//   }


//     let changePercent = $('div.change__percent').text().trim() || null;
//     let changeValueText = $('div.change__value').text().trim() || null;
//     let changeValue = changeValueText ? Number(changeValueText.replace(/[^0-9.-]/g, "")) : null;

//     const data = {
//       ticker: upperTicker,
//       name,
//       industry,
//       closingPrice,
//       changePercent,
//       changeValue,
//       timestamp: new Date(),
//     };

//     // Cache the result
//     cache[upperTicker] = { data, timestamp: Date.now() };

//     res.json(data);
//   } catch (err) {
//     console.error(`Error fetching data for ${upperTicker}:`, err.message);
//     res.status(500).json({ error: "Failed to fetch data", details: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });


// const express = require("express");
// const axios = require("axios");
// const cheerio = require("cheerio");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors());

// // ---------------- Cache ----------------
// const cache = {};
// const CACHE_DURATION = 5 * 60 * 1000; // 5 min cache

// app.get("/api/stock-info/:ticker", async (req, res) => {
//   const { ticker } = req.params;
//   const upperTicker = ticker.toUpperCase();

//   // Serve from cache
//   if (
//     cache[upperTicker] &&
//     Date.now() - cache[upperTicker].timestamp < CACHE_DURATION
//   ) {
//     return res.json(cache[upperTicker].data);
//   }

//   try {
//     const url = `https://dps.psx.com.pk/company/${upperTicker}`;
//     const { data: html } = await axios.get(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
//       },
//       timeout: 5000,
//     });

//     const $ = cheerio.load(html);

//     // ---------------- Basic Info ----------------
//     const name = $("div.quote__name").text().trim() || null;
//     const industry = $("div.quote__sector").text().trim() || null;

//     // ---------------- Closing Price ----------------
//     let priceText =
//       $("div.quote__close").text().trim() ||
//       $("div.quote__price").text().trim() ||
//       $("span#quote-close").text().trim();
//     const closingPrice = priceText
//       ? parseFloat(priceText.replace(/[^0-9.]/g, ""))
//       : null;

//     // ---------------- Change ----------------
//     const changePercent = $("div.change__percent").text().trim() || null;
//     const changeValueText = $("div.change__value").text().trim();
//     const changeValue = changeValueText
//       ? parseFloat(changeValueText.replace(/[^\d.-]/g, ""))
//       : null;

//     // ---------------- REG Tab Stats ----------------
//     const regStats = {};
//     $(".tabs__panel[data-name='REG'] .stats_item").each((i, el) => {
//       const label = $(el).find(".stats_label").text().trim();
//       const value = $(el).find(".stats_value").first().text().trim();
//       if (!label || !value) return;

//       // normalize label (remove * and ^)
//       const cleanLabel = label.replace(/[\*\^]/g, "").trim();
//       regStats[cleanLabel] = value;
//     });

//     // Helper for safe numeric extraction
//     const toNum = (v) =>
//       v && !isNaN(parseFloat(v.replace(/,/g, "")))
//         ? parseFloat(v.replace(/,/g, ""))
//         : null;

//     // ---------------- Extract Fields ----------------
//     const open = toNum(regStats["Open"]);
//     const high = toNum(regStats["High"]);
//     const low = toNum(regStats["Low"]);
//     const volume = toNum(regStats["Volume"]);
//     const value = toNum(regStats["Value"]);
//     const peRatio = toNum(regStats["P/E Ratio (TTM)"]);

//     // 52-week range parsing
//     let high52Week = null,
//       low52Week = null;
//     const range = regStats["52-WEEK RANGE"] || regStats["52 Week Range"];
//     if (range) {
//       const match = range.match(/([\d.]+)\s*—\s*([\d.]+)/);
//       if (match) {
//         low52Week = parseFloat(match[1]);
//         high52Week = parseFloat(match[2]);
//       }
//     }

//     // ---------------- Build Result ----------------
//     const result = {
//       ticker: upperTicker,
//       name,
//       industry,
//       closingPrice,
//       changePercent,
//       changeValue,
//       open,
//       high,
//       low,
//       volume,
//       value,
//       peRatio,
//       high52Week,
//       low52Week,
//       timestamp: new Date(),
//     };

//     // Remove null or undefined fields dynamically
//     const finalResult = {};
//     Object.entries(result).forEach(([key, val]) => {
//       if (val !== null && val !== undefined) finalResult[key] = val;
//     });

//     // Cache result
//     cache[upperTicker] = { data: finalResult, timestamp: Date.now() };

//     res.json(finalResult);
//   } catch (err) {
//     console.error(`❌ Error fetching ${ticker}:`, err.message);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// const express = require('express');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors());

// // ---------------- In-memory cache ----------------
// const cache = {};
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// app.get('/api/stock-info/:ticker', async (req, res) => {
//   const { ticker } = req.params;
//   const upperTicker = ticker.toUpperCase();

//   // Serve from cache if valid
//   if (cache[upperTicker] && (Date.now() - cache[upperTicker].timestamp < CACHE_DURATION)) {
//     return res.json(cache[upperTicker].data);
//   }

//   try {
//     const url = `https://dps.psx.com.pk/company/${upperTicker}`;
//     const response = await axios.get(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
//       },
//       timeout: 5000,
//     });

//     const $ = cheerio.load(response.data);

//     // ---------------- Basic Info ----------------
//     const name = $('div.quote__name').text().trim() || null;
//     const industry = $('div.quote__sector').text().trim() || null;

//     // ---------------- Closing Price ----------------
//     let priceText =
//       $('div.quote__close').text().trim() ||
//       $('div.quote__price').text().trim() ||
//       $('span#quote-close').text().trim() ||
//       $('span.quote__value').text().trim() ||
//       $('div.quote span.value').first().text().trim();

//     let closingPrice = null;

//     if (priceText) {
//       // Remove PKR, commas, spaces, non-breaking spaces
//       let numeric = priceText.replace(/PKR/gi, "").replace(/[,\s\xa0]/g, "").trim();
//       const match = numeric.match(/(\d+(\.\d+)?)/);
//       if (match) {
//         closingPrice = parseFloat(match[1]);
//       }
//     }

//     // ---------------- Change ----------------
//     let changePercent = $('div.change__percent').text().trim() || null;
//     let changeValueText = $('div.change__value').text().trim() || null;
//     let changeValue = changeValueText ? Number(changeValueText.replace(/[^0-9.-]/g, "")) : null;

//     // ---------------- Build Result ----------------
//     const result = {
//       ticker: upperTicker,
//       name,
//       industry,
//       closingPrice,
//       changePercent,
//       changeValue,
//       timestamp: new Date(),
//     };

//     // ---------------- Remove null/undefined fields ----------------
//     const finalResult = {};
//     Object.entries(result).forEach(([key, val]) => {
//       if (val !== null && val !== undefined) finalResult[key] = val;
//     });

//     // ---------------- Cache the result ----------------
//     cache[upperTicker] = { data: finalResult, timestamp: Date.now() };

//     res.json(finalResult);
//   } catch (err) {
//     console.error(`Error fetching data for ${upperTicker}:`, err.message);
//     res.status(500).json({ error: "Failed to fetch data", details: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });


const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// ---------------- In-memory cache ----------------
const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/api/stock-info/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const upperTicker = ticker.toUpperCase();

  // Serve from cache if valid
  if (cache[upperTicker] && (Date.now() - cache[upperTicker].timestamp < CACHE_DURATION)) {
    return res.json(cache[upperTicker].data);
  }

  try {
    const url = `https://dps.psx.com.pk/company/${upperTicker}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);

    // ---------------- Basic Info ----------------
    const name = $('div.quote__name').text().trim() || null;
    const industry = $('div.quote__sector').text().trim() || null;

    // ---------------- Closing Price ----------------
    let priceText =
      $('div.quote__close').text().trim() ||
      $('div.quote__price').text().trim() ||
      $('span#quote-close').text().trim() ||
      $('span.quote__value').text().trim() ||
      $('div.quote span.value').first().text().trim();

    let closingPrice = null;
    if (priceText) {
      const numeric = priceText.replace(/PKR/gi, "").replace(/[,\s\xa0]/g, "").trim();
      const match = numeric.match(/(\d+(\.\d+)?)/);
      if (match) closingPrice = parseFloat(match[1]);
    }

    // ---------------- Change ----------------
    let changePercent = $('div.change__percent').text().trim() || null;
    let changeValueText = $('div.change__value').text().trim() || null;
    let changeValue = changeValueText ? Number(changeValueText.replace(/[^0-9.-]/g, "")) : null;

    // ---------------- REG Tab Stats ----------------
    const regStats = {};
    $(".tabs__panel[data-name='REG'] .stats_item").each((i, el) => {
      const label = $(el).find(".stats_label").text().trim();
      const value = $(el).find(".stats_value").first().text().trim();
      if (!label || !value) return;
      const cleanLabel = label.replace(/[\*\^]/g, "").trim();
      regStats[cleanLabel] = value;
    });

    // Helper for numeric values
    const toNum = (v) =>
      v && !isNaN(parseFloat(v.replace(/,/g, ""))) ? parseFloat(v.replace(/,/g, "")) : null;

    const open = toNum(regStats["Open"]);
    const high = toNum(regStats["High"]);
    const low = toNum(regStats["Low"]);
    const volume = toNum(regStats["Volume"]);
    const peRatio = toNum(regStats["P/E Ratio (TTM)"]);

    // 52-week range
    let high52Week = null, low52Week = null;
    const range = regStats["52-WEEK RANGE"] || regStats["52 Week Range"];
    if (range) {
      const match = range.match(/([\d.]+)\s*—\s*([\d.]+)/);
      if (match) {
        low52Week = parseFloat(match[1]);
        high52Week = parseFloat(match[2]);
      }
    }

    // ---------------- Build Result ----------------
    const result = {
      ticker: upperTicker,
      name,
      industry,
      closingPrice,
      changePercent,
      changeValue,
      open,
      high,
      low,
      volume,
      peRatio,
      high52Week,
      low52Week,
      timestamp: new Date(),
    };

    // Remove null/undefined fields dynamically
    const finalResult = {};
    Object.entries(result).forEach(([key, val]) => {
      if (val !== null && val !== undefined) finalResult[key] = val;
    });

    // ---------------- Cache the result ----------------
    cache[upperTicker] = { data: finalResult, timestamp: Date.now() };

    res.json(finalResult);
  } catch (err) {
    console.error(`Error fetching data for ${upperTicker}:`, err.message);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
