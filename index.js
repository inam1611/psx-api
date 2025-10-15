const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/api/stock-info/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    const url = `https://dps.psx.com.pk/company/${ticker}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract name & sector safely
    const name = $('h1.company-name').first().text().trim() || null;
    const industry = $('span.sector').first().text().trim() || null;

    // Extract closing price safely
    let priceText = $('div.stock-price').first().text().trim() || null; // Update selector
    let closingPrice = null;
    if (priceText) {
      // Remove any currency symbols, commas
      closingPrice = Number(priceText.replace(/[^\d.]/g, ''));
      if (isNaN(closingPrice)) closingPrice = null;
    }

    // Optional: change % and value (if available)
    let changePercent = $('div.change-percent').first().text().trim() || null;
    let changeValueText = $('div.change-value').first().text().trim() || null;
    let changeValue = changeValueText ? Number(changeValueText.replace(/[^\d.-]/g, '')) : null;

    res.json({
      ticker,
      name,
      industry,
      closingPrice,
      changePercent,
      changeValue,
      timestamp: new Date()
    });
  } catch (err) {
    console.error(`Error fetching data for ${ticker}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
