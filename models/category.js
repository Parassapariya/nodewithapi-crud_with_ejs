const mongoose = require('mongoose');

const shema1 = new mongoose.Schema({
    cat_name:String,
    cat_slug:String,
    cat_img:String
});

module.exports =  mongoose.model('Category',shema1);