
//require env
require('dotenv').config({ path: './config/dev.env' })
const express = require("express")
const path = require('path')
const session = require('express-session')
const passport = require('passport')

const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express()
const port = process.env.PORT
//console.log(__dirname)

app.use(express.urlencoded( { extended: true } ))

const publicDirectoryPath = path.join(__dirname, '/public')
app.use(express.static(publicDirectoryPath))  //serve static files

// ejs
app.set('view engine', 'ejs')  // this looks for the file in root/views/

// expresss session
app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}))

// passport
app.use(passport.initialize())
app.use(passport.session())

// mongoose
require('./db/mongooseDb')

// User model
const { User } = require('./models/userModel')

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy())

// use static serialize and deserialize of model for passport session support
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GCLIENT_ID,
    clientSecret: process.env.GCLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:3000/auth/google/secrets'
    }, (accessToken, refreshToken, profile, cb) => {
        User.findOrCreate( { googleId: profile.id }, (err, user) => {
            return cb(err, user)
        })
    }
))

app.get('/' , (req, res) => {
    
    
    res.render('home.ejs', {})
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }
))

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect('/secrets');
  });

app.get('/login' , (req, res) => {
    
    res.render('login.ejs', {})
})


app.get('/register' , (req, res) => {
        
    res.render('register.ejs', {})
})

app.get('/secrets' , async (req, res) => {

    // if(req.isAuthenticated()){
    //     res.render('secrets.ejs')
    // }
    // else{
    //     res.redirect('/login')
    // }

    try {
        foundSecrets = await User.find({ secret : {$ne: null }})
        
        res.render('secrets.ejs', { usersWithSecrets: foundSecrets})
    } catch (error) {
        console.log(error);
    }

        
})

app.post('/register' , async (req, res) => {

    try {
        const newUser = await User.register({username: req.body.username}, req.body.password)
        if(!newUser){
            return console.log('no user created')
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/secrets')
        })

    } catch (error) {
        console.log(error)
        res.redirect('/register')
    }
    
    

    //===================
    
    /* const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    try {
        await newUser.save()
        res.render('secrets.ejs')

    } catch (error) {
        console.log(error)
    } */


})



app.post('/login' , passport.authenticate('local', { 
    successRedirect: '/secrets',
    failureRedirect: '/login' 
    }), (req, res) => {


    //console.log(req.user)
    //res.redirect('/secrets')

    //===================
    
    /* const username = req.body.username
    const password = req.body.password

    try {
        const user = await User.findByCredentials(username, password)
        
        if(user){
            res.render('secrets.ejs')
        }
        else{
            console.log('login error')
        }
        
    } catch (error) {
        console.log(error)
        
    } */

    /* try {
        const foundUser = await User.findOne( {email: username} )

        const match = await bcrypt.compare(password, foundUser.password)
        console.log(typeof(match), match)
        if(foundUser){
            if(match){
                res.render('secrets.ejs')
            }
            else{
                console.log('error with login 401')
            }
        }
        else{
            console.log('error with login 401')
        }
        
    } catch (error) {
        console.log(error)
    } */


})

app.get('/logout' , (req, res) => {
    req.logout()
    res.redirect('/')
})

/* app.get('*', (req, res) => {
    // res.sendFile(__dirname + '/views/the404.html')

    //ejs
    // res.render('error404', {
    //     title: '404',
    //     errorMessage: 'error 404; suss page not found'
    // })
}) */

app.get('/submit', (req, res) => {

    if(req.isAuthenticated()){
        res.render('submit.ejs')
        
    }
    else{
        res.redirect('/login')
    }

    
})

app.post('/submit', async (req, res) => {
    const newSecret = req.body.secret
    console.log(req.user._id)

    try {
        const foundUser = await User.findById( { _id: req.user._id})
        foundUser.secret = newSecret
        foundUser.save()
        console.log(foundUser)
        res.redirect('secrets')
        
    } catch (error) {
        console.log(error);
    }
})

app.listen( port , () => {
    console.log('now serving on port: ' + port)
    
})