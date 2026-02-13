const express = require('express')
const path = require('path')
var cookieParser = require("cookie-parser")
var session = require("express-session")
const app = express()
const UserController = require('./controllers/user') 
const { UserModel } = require('./models')
var debug = require("debug")("index.js");

app.use(express.json())
app.use(express.urlencoded(({ extended: false })))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use('/public', express.static(path.join(__dirname, 'public')))
app.use('/users', UserController)
app.use(cookieParser())
app.use(
  session({
    secret: "demoapp",
    name: "app",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } /* 1 hour */
  })
);
const checkLoggedIn = function(request, response, next) {
  if (request.session.loggedIn) {
    // debug(
    //   "checkLoggedIn(), req.session.loggedIn:",
    //   req.session.loggedIn,
    //   "executing next()"
    // );
    next();
  } else {
    // debug(
    //   "checkLoggedIn(), req.session.loggedIn:",
    //   req.session.loggedIn,
    //   "rendering login"
    // );
    response.redirect("login");
  }
}


app.get('/', checkLoggedIn, async function (request, response) {
  // res.sendFile(path.join(__dirname,'index.html'))
  const allUsers = await UserModel.getAllUsers()
  
  console.log(allUsers)
  response.render('index', { data: allUsers || [] })
})

app.post('/login', async function(req, res) {
  const { username, password } = req.body     
    try {
        const user = await UserModel.findUserByUsername(username)
        // FAIL-FAST 
        console.log({ user });
        if (user && (user.username === username) && (user.password === password)) {
          req.session.loggedIn = true
          res.redirect('/')

        } else {
        throw new Error('Unauthorized access')
        // if(!user || user.username !== username || user.password !== password) throw new Error('Unauthorized access')
        // req.session.loggedIn = true
        }
    }
    catch(error) {
      console.error(error)
      res.render('login', { errorMessage: error.message })
    }
})

app.get('/login', function(req, res) {
  if(req.session.loggedIn) return res.redirect('/')
  res.render('login')
})

app.get('/logout', function(req, res) {
  req.session.destroy()
  res.redirect('/login')
})

app.get('/register', function(req, res) {
  res.render('register', { errorMessage: null, successMessage: null })
})

app.post('/register', async function(req, res) {
  const { username, password, confirmPassword } = req.body

  // Server-side validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const numberRegex = /\d/
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/

  if (!username || !emailRegex.test(username)) {
    return res.render('register', { errorMessage: 'Username must be a valid email address.', successMessage: null })
  }
  if (!password || password.length < 6) {
    return res.render('register', { errorMessage: 'Password must be at least 6 characters.', successMessage: null })
  }
  if (!numberRegex.test(password)) {
    return res.render('register', { errorMessage: 'Password must contain at least 1 number.', successMessage: null })
  }
  if (!specialCharRegex.test(password)) {
    return res.render('register', { errorMessage: 'Password must contain at least 1 special character.', successMessage: null })
  }
  if (password !== confirmPassword) {
    return res.render('register', { errorMessage: 'Passwords do not match.', successMessage: null })
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findUserByUsername(username)
    if (existingUser) {
      return res.render('register', { errorMessage: 'Username already exists.', successMessage: null })
    }

    // Create new user
    const newUser = {
      username: username,
      password: password,
      name: '',
      gender: '',
      created: new Date().toISOString()
    }
    await UserModel.insertUser(newUser)
    res.redirect('/login')
  } catch (error) {
    console.error(error)
    res.render('register', { errorMessage: 'Registration failed. Please try again.', successMessage: null })
  }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})