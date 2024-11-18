//import environment variables, passwords and other sensitive information from .env file
require('dotenv').config()

//importing requirements
const express = require('express') //import express
const app = express() //creating instance of express
const bcrypt = require('bcrypt') //used to encrypt the user password
const passport = require('passport') //js framework for user authentication
const flash = require('express-flash')  //flash messages, temporary messages displayed to the user
const session = require('express-session')  //session-management
const methodOverride = require('method-override') //used for HTTP Methods like DELETE
const path = require('path');   //to work with file paths
const mysql = require('mysql2')     //for connection to mysql database


//static files and views
app.use(express.static(path.join(__dirname, 'public'))); //appends public to current directory name and serves the static files like CSS,HTML, images etc
app.set('views', path.join(__dirname, 'views')); //tells express that template files are stored inside the views folder
app.set('view-engine','ejs') //sets the view-engine to ejs

const initializePassport = require('./passport-config') 
const getUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
};

const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
};

initializePassport(passport, getUserByEmail, getUserById)
app.use(flash())
app.use(session({
    secret :  process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.use(express.urlencoded({ extended:false }))

//connection to the database 
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true
}).promise()

app.get('/', (req,res) => {
    res.render('index.ejs', {name: req.user ? req.user.name : 'Guest'})
})

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register',checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        
        // Execute the query
        const [results] = await pool.query(query, [req.body.name, req.body.email, hashedPassword]);
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})  

app.delete('/logout', (req, res) => { 
    req.logout(err => {
        if (err) {
            return next(err); 
        }
    res.redirect('/login')  
    })
})

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    } else{
        res.redirect('/login')
    }
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    } 
    next()
}

app.listen(3000)
