const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/stock-info/:ticker', async (req, res) => {
  const { ticker } = req.params;

  try {
    const url = `https://dps.psx.com.pk/company/${ticker}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let priceText = $('div.quote__close').text().trim();
    let closingPrice = priceText ? Number(priceText.replace("PKR", "").trim()) : null;

    res.json({
      ticker,
      closingPrice,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
