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
      console.log('Creating Users...');
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
  const _id = req.params._id;
  const { duration, description } = req.body;
  let date = req.body.date;
  const checkDate = !date ? new Date() : new Date(date);

  try {
    const exercise = {
      date: checkDate.toDateString(),
      duration: Number(duration),
      description: description,
    };

    const user = await UserModel.findById(_id).select('username');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await UserModel.updateOne({ _id: _id }, { $push: { exercises: exercise } });

    const response = {
      _id: user._id,
      username: user.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description,
    };

    return res.json(response);
  } catch (err) {
    console.log('Failed to update user...', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const _id = req.params._id;
  const { from, to, limit } = req.query;

  try {
    const user = await UserModel.findById(_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const userExercise = user.exercises;

    let filteredExercises = userExercise.filter((exercise) => {
      const exerciseDate = new Date(exercise.date);
      return (
        (!fromDate || exerciseDate >= fromDate) &&
        (!toDate || exerciseDate <= toDate)
      );
    });

    if (limit) {
      filteredExercises = filteredExercises.slice(0, parseInt(limit, 10));
    }

    const response = {
      _id: _id,
      username: user.username,
      count: userExercise.length,
      log: filteredExercises,
    };

    console.log(from, to, limit);
    return res.json(response);
  } catch (err) {
    console.log('Failed to fetch user...', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
