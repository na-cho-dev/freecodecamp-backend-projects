// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/:date?', (req, res) => {
  const date_param = req.params.date;
  let dateObj = new Date();

  if (!isNaN(Number(date_param))) {
    dateObj = new Date(Number(date_param));
  } else if (!isNaN(Date.parse(date_param))) {
    dateObj = new Date(date_param);
  } else if (!date_param) {
    dateObj = new Date();
  } else {
    return res.json({ error: 'Invalid Date' });
  }

  const utc_date = dateObj.toUTCString();
  const unix_date = Math.floor(dateObj.getTime());

  if (isNaN(dateObj.getTime())) {
    res.json({ error: 'Invalid Date' });
  } else {
    res.json({ unix: unix_date, utc: utc_date });
  }
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
