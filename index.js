const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const nanoid = require ('nanoid')
const bp = require('body-parser');

const nid = nanoid.nanoid();

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log('database connected.')
}).catch((err) => console.log(err.message));

const Schema = mongoose.Schema;

const userSchema = new Schema ({
  userName: {type: String, required: true},
  authKey: {type: String, required: true}
});
const exSchema = new Schema ({
  _id: {type: String, required: true},
  desc: {type: String, required: true},
  dura: {type: Number, required: true},
  date: {type: String, required: true}
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use("/api/users", bp.urlencoded({extended: false}));
app.use(bp.json());

//test first API endpoints
app.get('/api/hello', (req, res) => {
  res.send('Greetings: Hello and Welcome!');
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
