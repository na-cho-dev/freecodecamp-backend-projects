const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { randomBytes } = require('crypto');
require('dotenv').config();

const filename = 'data.json';
const dataFilePath = path.join(__dirname, filename);

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create to JSON File if it does not exist
const createJSONFile = async () => {
  try {
    await fs.access(dataFilePath);
    console.log(`File already exists: ${filename}`);
  } catch {
    try {
      await fs.writeFile(dataFilePath, JSON.stringify([], null, 2));
      console.log(`Created file: ${filename}`);
    } catch (err) {
      console.error(`Error creating file ${filename}: ${err.message}`);
    }
  }
};

// Read to JSON File
const readData = async () => {
  await createJSONFile();

  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    console.log(`Read file: ${filename}`);
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading or parsing file: ${err.message}`);
    return [];
  }
};

// Write to JSON File
const writeData = async (data) => {
  await createJSONFile();

  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
    console.log(`Wrote to file: ${filename}`);
  } catch (err) {
    console.error(`Error writing to file ${filename}: ${err.message}`);
  }
};

app
  .route('/api/users')
  .post(async (req, res) => {
    const username = req.body.username;
    const uid = randomBytes(16).toString('hex');
    const user = { _id: uid, username: username };
    const data = await readData(); // Get data file to push to

    data.push(user); // Push new user to json file
    writeData(data); // Save data to json file

    console.log(data);
    res.json({ username: username, _id: uid });
  })
  .get(async (req, res) => {
    const data = await readData();
    const userValues = data.map(({ _id, username }) => ({ _id, username }));

    res.json(userValues);
  });

app.post('/api/users/:_id/exercises', async (req, res) => {
  const _id = req.body[':_id'];
  const { date, duration, description } = req.body;
  const data = await readData();
  const userToFind = data.find((user) => user._id === _id) || {};

  const newDate = new Date(date);
  userToFind.date = newDate.toDateString();
  userToFind.duration = Number(duration);
  userToFind.description = description;

  writeData(data);

  res.json(userToFind);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
