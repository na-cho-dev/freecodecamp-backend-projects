require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const crypto = require('crypto');
const { URL } = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {};

app.post('/api/shorturl', (req, res) => {
  originalUrl = req.body.url;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const validUrl = new URL(originalUrl);

    if (validUrl.protocol !== 'http:' && validUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    dns.lookup(validUrl.hostname, (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid Hostname' });
      } else {
        const hashedUrl = crypto
          .createHash('md5')
          .update(validUrl.href)
          .digest('hex')
          .slice(0, 6);
        urlDatabase[hashedUrl] = originalUrl;
        console.log(hashedUrl);
        return res.json({
          original_url: originalUrl,
          short_url: hashedUrl,
        });
      }
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
});

app.get('/api/shorturl/:urlNumber', (req, res) => {
  const urlNumber = req.params.urlNumber;
  const originalUrl = urlDatabase[urlNumber];

  if (!originalUrl)
    return res
      .status(404)
      .json({ error: 'No short URL found for the given input' });

  res.redirect(originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
