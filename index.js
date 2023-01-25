const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bp = require('body-parser');

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
  console.log('database connected.')
}).catch((err) => console.log(err.message));

//Importing MongoDB Models for Users and Exercises
const User = require('./dbmodels/user');
const Exercise = require('./dbmodels/exercise');

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
   .post(async (req, res) => {
       const user = req.body.username;
       const existingUser = await User.findOne({userName: user});
     try {
       if (existingUser) {
         res.json({"username": existingUser.userName, "_id": existingUser._id, "Status": "Existing User Found"});
       } else {
         const newuser = new User (
           {userName: user}
         );
         newuser.save()
                .then(saved => {
                  res.json({"username": saved.userName, "_id": saved._id, "AuthKey": saved.authKey, "Status": "New User Created! Save your AuthKey! Currently there is no way to retrieve your AuthKey!"})
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
app.route('/api/users/:id/exercises')
   .post( async (req, res) => {
      const userId = req.body._id;
      const userAuthKey = req.body.authkey;
      const validId = /^[a-f\d]{24}$/;
      if (validId.test(userId) === false) {
        res.send("Invalid UserID Format. It must be a single String of 12 bytes or a string of 24 hex characters");
      } else {
        const existingUser = await User.findOne({_id: userId});
          try{
            if (!existingUser) {
              res.send("User Not Found. Please Register with 'Create a New User'");
            } else {
                if (userAuthKey !== existingUser.authKey) {
                  res.status(403).send("Auth Key Incorrect");
                } else {
                  const {description, duration, date} = req.body;
                  const newExercise = new Exercise (
                    {
                      ///
                    }
                  )
                }
              }
          } catch (err) {
              console.log(err);
            }
        }
   });


//Exercise Tracker Get User Exercise Log
//app.get('/api/users/:_id/logs');

//include total exercise count by objects retrieved

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
