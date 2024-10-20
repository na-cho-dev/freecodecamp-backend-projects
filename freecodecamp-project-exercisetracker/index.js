const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const UserModel = require('./db.cjs').User;

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
  console.log(UserModel);
});

app
  .route('/api/users')
  .post(async (req, res) => {
    const username = req.body.username;
    let _id;
    const user = new UserModel({
      username: username,
    });

    try {
      const response = await user.save();
      console.log(response);
      _id = response._id.toString();
      return res.json({ username: username, _id: _id });
    } catch (err) {
      console.log(err);
    }
  })
  .get(async (req, res) => {
    let users;

    try {
      users = await UserModel.find({}, { _id: 1, username: 1 });
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    return res.json(users);
  });

app.post('/api/users/:_id/exercises', async (req, res) => {
  const _id = req.body[':_id'];
  const { date, duration, description } = req.body;

  let formattedDate = new Date(date);
  const user = await UserModel.findOne({ _id: _id }, { __v: 0 });
  // Update User Info
  await UserModel.updateOne(
    { _id: _id },
    {
      date: formattedDate.toDateString(),
      duration: duration,
      description: description,
    }
  );

  console.log(user);

  res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
