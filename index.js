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
const Search = require('./action/usersearch.js')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use("/api/users", bp.urlencoded({extended: false}));
app.use(bp.json());

//Exercise Tracker Add New Users and View All Users
app.route('/api/users')
  //Viewing a list of user without displaying their auth key
   .get((req, res) => {
      Search.listUser()
            .then(list => {
              res.send(list);
            })
            .catch(err => {
                console.log(err);
                res.send("An Error has occured.");
     /*
     User.find()
         .select("-authKey -__v")
         .exec((err, records) => {
           if (err) {return console.log(err)} else {
             res.send(records);
           }
         });
     */
    });
   }) 
  //HTML form
   .post((req,res) => {
     const user = req.body.username;
     User.findOne({userName: user}, (err, found) => {
       if (err) {
         console.log(err);
         return;
       }
       //Check if user exists
       if (found) {
         res.json({"username": found.userName, "_id": found._id, "Status": "Existing User Found"});
       } else {
         //If not, create new user
         const newuser = new User (
           {userName: user}
         );
         newuser.save()
                .then(saved => {
                  res.json({"username": saved.userName, "_id": saved._id, "AuthKey": saved.authKey, "Status": "New User Created! Save your AuthKey! Currently there is no way to retrieve your AuthKey!"})
                })
                .catch(err => {
                  console.log(err);
                  res.send("An error has occured!");
                });
       }
     });
   });

//Exercise Tracker Log Exercises
app.route('/api/users/:id/exercises')
   .post( async (req, res) => {
     //Variables from the html form
      const userId = req.body._id;
      const userAuthKey = req.body.authkey;
      const exDesc = req.body.description;
      const exDura = req.body.duration;
      const exDate = req.body.date;
      const validId = /^[a-f\d]{24}$/;
      //check if user ID is the correct format (MongoDB Obj ID, hex24)
      if (validId.test(userId) === false) {
        res.send("Invalid UserID Format. It must be a single String of 12 bytes or a string of 24 hex characters");
      } else {
        //If ID is correct format, check if user exists
        const existingUser = await User.findOne({_id: userId});
          try{
            //if user does not exist
            if (!existingUser) {
              res.send("User Not Found. Please Register with 'Create a New User'.");
            } else {
              //if user exists, check if their auth key is correct
                if (userAuthKey !== existingUser.authKey) {
                  res.status(403).send("Auth Key Incorrect");
                } else {
                  //if their auth key is correct, log user's exercise event
                  const newExercise = new Exercise ({
                      userName: existingUser.userName,
                      desc: exDesc,
                      dura: exDura,
                    });
                  //if date is entered, register the entered date, otherwise it defaults
                  if (exDate) {
                    newExercise.date = exDate;
                  }
                  //save and response the json
                  newExercise.save()
                             .then(saved => {
                               res.json({
                                 "_id": userId,
                                 "username": saved.userName,
                                 "description": saved.desc,
                                 "duration": saved.dura,
                                 "date": saved.date.toDateString()
                               });
                             })
                             .catch(err => {
                               console.log(err);
                               res.send("An Error has occured.");
                             });
                }
              }
          } catch (err) {
              console.log(err);
            }
        }
   });

//Exercise Tracker Get User Exercise Log
app.route('/api/users/:_id/logs')
   .get( async (req, res) => {
     const id = req.params._id;
     const {from, to, limit} = req.query;
     const existingUser = await User.findOne({_id: id});
     try {
     //if user does not exist
        if (!existingUser) {
          res.send("User Not Found. Please Register with 'Create a New User'.");
        } else {
          res.send("User Found")
        }
     } catch (err) {
       console.log(err);
     }
   });

//include total exercise count by objects retrieved

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
