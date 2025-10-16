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


// index.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// -------------------------------
// In-memory cache
// -------------------------------
const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// -------------------------------
// Main API Route
// -------------------------------
app.get("/api/stock-info/:ticker", async (req, res) => {
  const { ticker } = req.params;
  const upperTicker = ticker.toUpperCase();

  // ✅ Return cached data if still valid
  if (
    cache[upperTicker] &&
    Date.now() - cache[upperTicker].timestamp < CACHE_DURATION
  ) {
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

    // -------------------------------
    // ✅ Basic Info
    // -------------------------------
    const name = $("div.quote__name").text().trim() || null;
    const industry = $("div.quote__sector").text().trim() || null;

    // -------------------------------
    // ✅ Price Extraction (robust)
    // -------------------------------
    let priceText =
      $("div.quote__close").text().trim() ||
      $("div.quote__price").text().trim() ||
      $("span#quote-close").text().trim() ||
      $("span.quote__value").text().trim() ||
      $("div.quote span.value").first().text().trim();

    let closingPrice = null;
    if (priceText) {
      let numeric = priceText
        .replace(/PKR/gi, "")
        .replace(/[,\s\xa0]/g, "")
        .trim();

      const match = numeric.match(/(\d+(\.\d+)?)/);
      closingPrice = match ? parseFloat(match[1]) : null;
    }

    // -------------------------------
    // ✅ Change Info
    // -------------------------------
    let changePercent = $("div.change__percent").text().trim() || null;
    let changeValueText = $("div.change__value").text().trim() || null;
    let changeValue = changeValueText
      ? Number(changeValueText.replace(/[^0-9.-]/g, ""))
      : null;

    // -------------------------------
    // ✅ Helper: Extract clean table value by label
    // -------------------------------
    const extractValue = (labels = []) => {
      let value = null;
      for (const label of labels) {
        const cell = $(`td:contains('${label}')`)
          .filter(function () {
            return $(this).text().trim().toLowerCase() === label.toLowerCase();
          })
          .next("td");

        if (cell.length) {
          const joined = cell
            .find("*")
            .addBack()
            .contents()
            .map(function () {
              return $(this).text().trim();
            })
            .get()
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          if (joined) {
            value = joined;
            break;
          }
        }
      }
      return value || null;
    };

    // -------------------------------
    // ✅ Extended info extraction
    // -------------------------------
    const marketCap = extractValue(["Market Cap", "Market Capitalization"]);
    const volume = extractValue(["Volume", "Volume Traded"]);
    const eps = extractValue(["EPS", "Earnings Per Share"]);
    const peRatio = extractValue(["P/E Ratio", "PER", "Price to Earnings"]);
    const bookValue = extractValue(["Book Value", "Book Value / Share"]);
    const high52Week = extractValue(["52 Weeks High", "52 Week High"]);
    const low52Week = extractValue(["52 Weeks Low", "52 Week Low"]);
    const beta = extractValue(["Beta", "Beta Value"]);

    // -------------------------------
    // ✅ Combined Data Object
    // -------------------------------
    const data = {
      ticker: upperTicker,
      name,
      industry,
      closingPrice,
      changePercent,
      changeValue,
      marketCap,
      volume,
      eps,
      peRatio,
      bookValue,
      high52Week,
      low52Week,
      beta,
      timestamp: new Date(),
    };

    // -------------------------------
    // ✅ Cache Result
    // -------------------------------
    cache[upperTicker] = { data, timestamp: Date.now() };

    // Send to client
    res.json(data);
  } catch (err) {
    console.error(`Error fetching data for ${upperTicker}:`, err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: err.message });
  }
});

// -------------------------------
// Start Server
// -------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
