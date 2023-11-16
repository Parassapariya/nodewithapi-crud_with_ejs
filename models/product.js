const mongoose = require('mongoose');

const shema = new mongoose.Schema({
    product_name:{ type:String,required: true, unique: true  },
    cat_id:{type:mongoose.Schema.Types.ObjectId,ref:'Category',required: true},
    discription:{type:String},
    size:{type:String},
    p_img:{type:String},
    gst:{type:String},
    date: { type: Date, default: Date.now },
});

module.exports =  mongoose.model('products',shema);