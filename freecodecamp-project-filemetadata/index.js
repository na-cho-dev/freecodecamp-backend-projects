var express = require('express');
var cors = require('cors');
require('dotenv').config();
const multer = require('multer');

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage: fileStorageEngine });

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const file = req.file;
  console.log(file);
  const response = {
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  };

  res.json(response);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});
