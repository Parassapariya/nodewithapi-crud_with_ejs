const express = require('express');
const route = express.Router();
require('../connection');
const model = require('../model');
const multer = require('multer');

//image uplord

let stroge = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uplord');
    },
    filename:(req,file,cb)=>{
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname)
    },
});


//all page routes
route.get('/login', (req, res) => {
    res.render('login');
});

route.get('/', (req, res) => {
    res.render('home');
});

route.get('/deshboard',(req, res)=>{
    res.render('admin/deshboard');
});

route.get('/category',(req, res)=>{
    res.render('admin/category');
});

//signup route
    route.post('/signup', async (req, res) => {
        let username = req.body.logname;
        let email = req.body.logemail;
        let password = req.body.logpass;
        let data = new model({ username: `${username}`, email: `${email}`, password: `${password}` });
        let result = await data.save();
        if (result) {
            res.redirect('/');
        }
    });

//login route 
    route.post('/Login', async (req, res) => {
        let us = req.body.logname12;
        let pk = req.body.logpass12;
        let check = await model.findOne({ username: `${us}` });
        if (check.password == `${pk}`) {
            req.session.check = check;
            req.session.authorized = true;
            res.redirect('/deshboard');
        } else {
            res.send("not loginn");
        }
    });


module.exports = route;