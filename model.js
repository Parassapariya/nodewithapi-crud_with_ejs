const mongoose = require('mongoose');

const shema = new mongoose.Schema({
    username:String,
    email:String,
    password:String
});

module.exports =  mongoose.model('logins',shema);