const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const exSchema = new Schema ({
  userName: {type: String, required: true},
  desc: {type: String, required: true},
  dura: {type: Number, required: true},
  date: {type: Date, default: Date.now() }
});

module.exports = mongoose.model('Exercise', exSchema);