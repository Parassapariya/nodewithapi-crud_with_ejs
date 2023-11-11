require("dotenv").config();
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyparser = require('body-parser')
const session = require('express-session');
const port = process.env.PORT || 5000;



const app = express();

//public folder path join
app.use(express.static(path.join(__dirname, 'public')));

//middleware
app.use(session({
    secret: "My screact Key",
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})


//route
app.use("",require('./routes/route'))

//port
app.listen(port, () => {
    console.log();
});