const mongoose = require('mongoose');

const shema = new mongoose.Schema({
    username:{ type: String, required: true, unique: true },
    email:{ type: String, required: true, unique: true },
    password:String
});



module.exports =  mongoose.model('logins',shema);