
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const flash = require('connect-flash');
const User = require('./models/user');
const storyRoutes = require('./routes/mainRoutes.js');
const agroRoutes = require('./routes/agroRoutes.js');
const mongoose = require('mongoose');

const app = express();


let port = 3000;
let host='localhost';
app.set('view engine','ejs');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/demos',{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    //start the server only if conection to db is successfull
app.listen(port, host, (req,res)=>{
    console.log("server is running on port:"+ port);
})
})
.catch(err=>{
    console.log(err.message);
})

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new mongoStore({mongoUrl: 'mongodb://127.0.0.1:27017/demos'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName || null;
    res.locals.lastName = req.session.lastName || null;
    next();
});


app.get('/',(req,res) => {
    res.render('index.ejs');
});

app.use('/stories', storyRoutes);
app.use('/agro', agroRoutes);

//404 error handler
app.use((req,res, next) => {
    let err = new Error('The Server Cannot locate' + req.url);
    err.status=404;
    next(err);
});


// 500 error handler
app.use((err, req, res, next)=> {
    console.log(err.stack);
    if (!err.status){
        err.status = 500;
        err.message=("Internal server error");
    }
    res.status(err.status);
    res.render('error', {error:err});
});






