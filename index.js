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

// index.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// In-memory cache
const cache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

app.get('/api/stock-info/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const upperTicker = ticker.toUpperCase();

  // Return cached data if valid
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
      timeout: 5000, // 5 seconds timeout
    });

    const $ = cheerio.load(response.data);

    const name = $('div.quote__name').text().trim() || null;
    const industry = $('div.quote__sector').text().trim() || null;

    let priceText = $('div.quote__close').text().trim(); // e.g. "PKR 123.45"
    let closingPrice = null;
    if (priceText) {
      closingPrice = Number(priceText.replace(/[^0-9.]/g, ""));
      if (isNaN(closingPrice)) closingPrice = null;
    }

    let changePercent = $('div.change__percent').text().trim() || null;
    let changeValueText = $('div.change__value').text().trim() || null;
    let changeValue = changeValueText ? Number(changeValueText.replace(/[^0-9.-]/g, "")) : null;

    const data = {
      ticker: upperTicker,
      name,
      industry,
      closingPrice,
      changePercent,
      changeValue,
      timestamp: new Date(),
    };

    // Cache the result
    cache[upperTicker] = { data, timestamp: Date.now() };

    res.json(data);
  } catch (err) {
    console.error(`Error fetching data for ${upperTicker}:`, err.message);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
