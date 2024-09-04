const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  promptsCount: {
    type: Number,
    default: 0,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
  upVotedPrompts: {
    type : Array,
    default: []
  },
  downVotedPrompts: {
    type : Array,
    default: []
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
