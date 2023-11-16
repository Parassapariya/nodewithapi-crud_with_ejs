const express = require('express');
const route = express.Router();
require('../connection');
const cate = require('../models/category');
const product = require('../models/product');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;


//middleware
const md = (req, res, next) => {
    if (req.session.authorized) {
        next();
    } else {
        req.session.message = {
            type: 'error',
            message: 'Please Enter Username Or Password After You Are Access!!'
        }
        res.redirect('/login');
    }
}

//imag
let stroge = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uplord/product');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    },
});

let uplord = multer({
    storage: stroge
}).single('proimg');


route.get('/product', md, async (req, res) => {
    let result = await product.find().populate('cat_id');
    let data = await cate.find().exec();
    console.table(result);
    res.render('admin/product', { user: result, cat: data });
});

route.post('/product_add', uplord, async (req, res) => {
    let Data = {
        txt_pronm: req.body.txt_pronm,
        catid: req.body.catid,
        discription: req.body.p_des,
        size: req.body.chk_pro,
        gst: req.body.gst,
        proimg: req.file.filename,
    };
    let data = new product({ product_name: `${Data.txt_pronm}`, cat_id: `${Data.catid}`, discription: `${Data.discription}`, size: `${Data.size}`, p_img: `${Data.proimg}`, gst: `${Data.gst}` });
    let result = await data.save();
    if (result) {
        req.session.message = {
            type: 'success',
            message1: 'Product added successfully'
        }
        res.redirect('/product');
    } else {
        req.session.message = {
            type: 'error',
            message: 'Product add not successfully'
        }
        res.redirect('/product');
    }
});

route.get('/pro_del/:id',async (req,res) =>{
    let id = req.params.id;
    let result = await product.findOneAndDelete({_id:id});
    if (result) {
        let imgpath = result.p_img;
        if (imgpath) {
            let delpath = path.join(__dirname,'../uplord/product',imgpath);
            await fs.unlink(delpath);
            console.log(delpath);
        }
        req.session.message = {
            type: 'success',
            message1: 'Product deleted successfully'
        }
        res.redirect('/product');
    } else {
        console.log('Document not found.');
    }
})

route.get('/Pro_Edit_Get/:id',async (req,res)=>{
    let id = req.params.id;
    let result = await product.findById({_id:id});
    res.json({
        data:result
    })
});

route.post('/product_edit',uplord,async(req,res)=>{
    let Data = {
        id:req.body.id,
        txt_pronm: req.body.txt_pronm,
        catid: req.body.catid,
        discription: req.body.p_des,
        size: req.body.chk_pro1,
        gst: req.body.gst,
        //newimg: req.file.filename,
       
    };
    let newimg = "";
    if (req.file) {
        newimg = req.file.filename;
        const imagePathToDelete = path.join(__dirname, '../uplord/product', req.body.oldimg);
        await fs.unlink(imagePathToDelete);
    } else {
        newimg = req.body.oldimg;
    }

    let result = await product.findByIdAndUpdate(
        { _id: Data.id },
        {
            $set:
            {
                product_name: Data.txt_pronm,
                cat_id: Data.catid,
                discription: Data.discription,
                size:`${Data.size}`,
                p_img:newimg,
                gst:Data.gst
            }
        }
    );
    if (result) {

        req.session.message = {
            type: 'success',
            message1: 'Product Update successfully'
        }
        res.redirect('/product');

    } else {
        console.log('Document not found.');
    }
    
    // console.log(Data);
});

module.exports = route;