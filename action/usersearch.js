const mongoose = require('mongoose')
const User = require('../dbmodels/user');

const listUser = async () => {
      const list = await User.find()
                              .select("-authKey -__v");
                /*.exec((err, records) => {
                if (err) {
                  console.log(err)
                } else {
                  return records;
                }
                });*/
      console.log(list);
      return list;
};

module.exports.listUser = listUser;