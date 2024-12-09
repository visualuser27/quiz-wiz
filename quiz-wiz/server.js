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
app.set('views', path.join(__dirname,'views')); //tells express that template files are stored inside the views folder
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

app.use(express.json());
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

//check if the user is authenticated
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    } else{
        res.redirect('/login')
    }
}

// check is the user is not authenticated
function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    } 
    next()
}

app.listen(3000)

//flashcard routine

//display the flashcard.ejs
app.get('/flashcards', checkAuthenticated, (req, res) => {
    res.render('flashcards.ejs');
  });

//add flashcard
app.post('/addFlashcard', checkAuthenticated, async (req, res) => {
    const { question, answer, setName } = req.body;

    console.log('Received data:', req.body); // Debugging log

    // Ensure all fields are provided
    if (!question || !answer || !setName) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let setId = null;
    try {
        // Step 1: Check if the set exists or create it
        const [setResults] = await pool.query('SELECT * FROM flashcard_sets WHERE set_name = ? AND user_id = ?', [setName, req.user.id]);

        // If set doesn't exist, create it
        if (setResults.length === 0) {
            const [setInsertResults] = await pool.query('INSERT INTO flashcard_sets (user_id, set_name) VALUES (?, ?)', [req.user.id, setName]);
            setId = setInsertResults.insertId; // Get the ID of the newly created set
        } else {
            setId = setResults[0].set_id; // If set exists, get the set_id from the results
        }

        // Step 2: Insert the flashcard for the logged-in user
        const query = 'INSERT INTO flashcards (user_id, set_id, question, answer) VALUES (?, ?, ?, ?)';
        const [results] = await pool.query(query, [req.user.id, setId, question, answer]);

        console.log('Flashcard added:', results); // Debugging log

        // Step 3: Return a success response with the flashcard ID
        return res.json({ success: true, flashcardId: results.insertId });

    } catch (error) {
        console.error('Error adding flashcard:', error); // Debugging log
        return res.status(500).json({ success: false, message: 'An error occurred while adding the flashcard' });
    }
});
app.post('/saveFlashcardSet', checkAuthenticated, async (req, res) => {
    const { setName, flashcards } = req.body;
    const userId = req.user.id;  // Assuming `req.user.id` is the logged-in user's ID
  
    try {
      // 1. Insert the flashcard set into flashcard_sets table
      const [setResults] = await pool.query(
        'INSERT INTO flashcard_sets (user_id, set_name) VALUES (?, ?)',
        [userId, setName]
      );
  
      const setId = setResults.insertId;  // Get the ID of the newly inserted set
  
      // 2. Insert each flashcard into flashcards table
      const flashcardPromises = flashcards.map(flashcard => {
        return pool.query(
          'INSERT INTO flashcards (user_id, set_id, question, answer) VALUES (?, ?, ?, ?)',
          [userId, setId, flashcard.question, flashcard.answer]
        );
      });
  
      // Wait for all flashcards to be inserted
      await Promise.all(flashcardPromises);
  
      // 3. Send success response
      res.json({ success: true, message: 'Flashcard set saved successfully' });
    } catch (error) {
      console.error('Error saving flashcard set:', error);  // Log detailed error
      res.status(500).json({ success: false, message: 'Error saving flashcard set' });
    }
  });
  
  app.get('/getFlashcardSets', checkAuthenticated, async (req, res) => {
    const userId = req.user.id; // Assuming `req.user.id` is the logged-in user's ID
  
    try {
      // Query to fetch all flashcards and their associated set details in one go
      const [rows] = await pool.query(
        `SELECT 
           f.set_id AS set_id, 
           fs.set_name AS name, 
           fs.created_at, 
           f.question, 
           f.answer 
         FROM flashcard_sets fs
         LEFT JOIN flashcards f ON fs.set_id = f.set_id
         WHERE fs.user_id = ?
         ORDER BY fs.set_id, f.flashcard_id`, // Order by set and flashcard ID for easier grouping
        [userId]
      );
  
      // Transform the result into the desired structure
      const setsWithFlashcards = rows.reduce((acc, row) => {
        let set = acc.find(s => s.set_id === row.set_id);
        if (!set) {
          set = {
            set_id: row.set_id,
            name: row.name,
            created_at: row.created_at,
            flashcards: []
          };
          acc.push(set);
        }
  
        if (row.question && row.answer) {
          set.flashcards.push({
            question: row.question,
            answer: row.answer
          });
        }
  
        return acc;
      }, []);
  
      // Send the structured data back to the client
      res.json({ success: true, sets: setsWithFlashcards });
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      res.status(500).json({ success: false, message: 'Error fetching flashcard sets' });
    }
  });
  
