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
  authKey: {type: String, required: true, default: nid}
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
app.route('/api/hello')
  .get((req, res) => {
  res.send('Greetings: Hello and Welcome!');
});

//Exercise Tracker Add New Users and View All Users
app.route('/api/users')
   .get((req, res) => {
     User.find()
         .select("-authKey")
         .exec((err, records) => {
           if (err) {return console.log(err)} else {
             res.send(records);
           }
         });
   })
   .post( async (req, res) => {
     try {
       const user = req.body.username;
       const existingUser = await User.findOne({userName: user});
       if (existingUser) {
         res.json({"username": existingUser.userName, "_id": existingUser._id, "Status": "Existing User Found"});
       } else {
         const newuser = new User (
           {userName: user}
         );
         newuser.save()
                .then(saved => {
                  res.json({"username": saved.userName, "_id": saved._id, "AuthKey": saved.authKey, "Status": "New User Created! Save your AuthKey!"})
                })
                .catch(err => {
                  res.send("An error has occured!");
                })
         }
     } catch (err) {
       console.log(err);
     }
   });


//Exercise Tracker Log Exercises
//app.post('/api/users/:_id/exercises');


//Exercise Tracker Get User Exercise Log
//app.get('/api/users/:_id/logs');

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
