const mongoose = require('mongoose');

const DATABASE_URI = process.env.DATABASE_URI;
mongoose.connect(DATABASE_URI);

const userSchema = new mongoose.Schema({
  username: String,
  date: String,
  duration: Number,
  description: String,
});

const User = mongoose.model('User', userSchema);
module.exports = { User };
