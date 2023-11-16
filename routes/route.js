const express = require('express');
const route = express.Router();
require('../connection');
const model = require('../models/model');
const category = require('../models/category');
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



//image uplord
let stroge = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uplord');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    },
});

let uplord = multer({
    storage: stroge
}).single('catimg');


//all page routes
route.get('/login', (req, res) => {
    res.render('login');
});

route.get('/', (req, res) => {
    res.render('home');
});

route.get('/deshboard', md, (req, res) => {
    res.render('admin/deshboard');
});

route.get('/category', md, async (req, res) => {
    let result = await category.find().exec();
    res.render('admin/category', { user: result });
});


//categoryaddd
route.post('/cat_add', uplord, async (req, res) => {
    let txt_catnm = req.body.txt_catnm;
    let txt_catslg = req.body.txt_catslg;
    let catimg = req.file.filename;
    // console.log(txt_catnm,txt_catslg,catimg);
    let data = new category({ cat_name: `${txt_catnm}`, cat_slug: `${txt_catslg}`, cat_img: `${catimg}` });
    let result = await data.save();
    if (result) {
        req.session.message = {
            type: 'success',
            message: 'category add success fully'
        }
        res.redirect('/category');
    }
})

//category delete
route.get('/cat_del/:id', async (req, res) => {
    let id = req.params.id;
    let result = await category.findOneAndDelete({ _id: id });
    if (result) {
        const imagePath = result.cat_img;

        // Delete the associated image file
        if (imagePath) {
            const imagePathToDelete = path.join(__dirname, '../uplord', imagePath);
            await fs.unlink(imagePathToDelete);
            console.log(imagePathToDelete);
        }
        req.session.message = {
            type: 'success',
            message: 'category deleted successfully'
        }
        res.redirect('/category');
    } else {
        console.log('Document not found.');
    }
});

//Edit Data Get Into Modal
route.get('/Cat_Edit_Get/:id', async (req, res) => {
    let id = req.params.id;
    let result = await category.findById({ _id: id });
    res.json({
        data: result,
    })
});

//Edit Data
route.post('/cat_edit', uplord, async (req, res) => {
    let id = req.body.id;
    let txt_catnm = req.body.txt_catnm;
    let txt_catslg = req.body.txt_catslg;
    let newimg = "";
    if (req.file) {
        newimg = req.file.filename;
        const imagePathToDelete = path.join(__dirname, '../uplord', req.body.oldimg);
        await fs.unlink(imagePathToDelete);
    } else {
        newimg = req.body.oldimg;
    }

    let result = await category.findByIdAndUpdate(
        { _id: id },
        {
            $set:
            {
                cat_name: txt_catnm,
                cat_slug: txt_catslg,
                cat_img: newimg,
            }
        }
    );
    if (result) {

        req.session.message = {
            type: 'success',
            message: 'category Updated successfully'
        }
        res.redirect('/category');

    } else {
        console.log('Document not found.');
    }
});




// -------------------------------------------------------------------------------------
//logout
route.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

//checkusername exits
route.post('/checkuniq/:field/:val', async (req, res) => {
    try {

        const existingUser = await model.findOne({ [req.params.field]: req.params.val });
        res.json({ isUnique: !existingUser });
    }
    catch (error) {
        console.error('Error checking uniqueness:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//signup route
route.post('/signup', async (req, res) => {
    try {
        let username = req.body.logname;
        let email = req.body.logemail;
        let password = req.body.logpass;
        let data = new model({ username: `${username}`, email: `${email}`, password: `${password}` });
        let result = await data.save();
        if (result) {
            req.session.message = {
                type: 'success',
                message1: 'Account Create Successfully Please Login'
            }
            res.redirect('/login');
        }
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            // Duplicate username error
            req.session.message = {
                type: 'error',
                message: 'Username Already Exits Please Enter Uniqe Username'
            }
            res.redirect('/login');
        }else if(error.code === 11000 && error.keyPattern && error.keyPattern.email){
            req.session.message = {
                type: 'error',
                message: 'Email Already Exits Please Enter Uniqe Email'
            }
            res.redirect('/login');
        } else {

            return res.status(500).json({ error: error.message });
        }
    }

});


//login route 
route.post('/Login', async (req, res) => {
    let us = req.body.logname12;
    let pk = req.body.logpass12;

    let check = await model.findOne({ username: `${us}`, password: `${pk}` });
    if (check) {
        req.session.authorized = us;
        res.redirect('/deshboard');
    } else {
        req.session.message = {
            type: 'error',
            message: 'Please Enter Valid Username Or Password'
        }
        res.redirect('/login');
    }
});


module.exports = route;