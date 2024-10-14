if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path');
const mysql = require('mysql2')


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));


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

app.set('view-engine','ejs')
app.use(express.urlencoded({ extended:false }))

//connection to the database 
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true
}).promise()

app.get('/', checkAuthenticated, (req,res) => {
    res.render('index.ejs', {name: req.user.name})
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
