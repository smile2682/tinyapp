//grabing and setting all the needed dependencies
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser())
const morgan = require ('morgan')
app.use(morgan('dev'))
const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // found in the req.params object
// const hashedPassword = bcrypt.hashSync(password, 10);


//set the in-memory database for url pairs
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID:"2nVx2b"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "Kx5ms9"
  }
};

//set the in-memory database for users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Read -the new url page
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user:users[req.cookies.user_id]
   };
   if(users[req.cookies.user_id]){
  return res.render("urls_new",templateVars);
   };
   res.redirect ('/login')
});

//Browse -all urls
app.get("/urls", (req, res) => {
  const singleUserDb = getUrlsForUser(req.cookies.user_id);
  const templateVars = { 
    urls: singleUserDb, 
    user:users[req.cookies.user_id]
  }
  if(users[req.cookies.user_id]){
    return res.render("urls_index",templateVars);
  };
  res.send('Please login first!')
});

//Read -a url, redirects to the single url page or post error
app.get("/urls/:shortURL", (req, res) => {
  const singleUserDb = getUrlsForUser(req.cookies.user_id);
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL:req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user:users[req.cookies.user_id]
  };

if(!urlDatabase[req.params.shortURL]){
  return res.send("Not a valid URL!");
}
if(!singleUserDb[shortURL]){
  return res.send('Unauthorized to see the short url requested!')
}
  res.render("urls_show", templateVars);
});

//Add -use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls/new", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL]={
    longURL : req.body.longUrl,
    userID : req.cookies.user_id
  }
  console.log(urlDatabase[shortURL]);
  console.log(req.body.longUrl)

  res.redirect(`/urls/${shortURL}`);
});

//Read -the shortURL created and redirect the client to the actuall website
app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]){
  return res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
  res.redirect ('/urls')
});

//function to generate a random string
function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}
  
//Delete -a URL
app.post("/urls/:shortURL/delete",(req,res)=>{
  const singleUserDb = getUrlsForUser(req.cookies.user_id);
  const shortURL = req.params.shortURL;
  
if(!singleUserDb[shortURL]){
  return res.send('Unauthorized to delete the short url requested!')
}
  delete urlDatabase[shortURL];

  res.redirect ('/urls')
  })

//Edit -a URL
app.post("/urls/:shortURL",(req,res)=>{
  const shortURL = req.params.shortURL;
  const singleUserDb = getUrlsForUser(req.cookies.user_id);
  const newURL = req.body.newURL;
  if(!singleUserDb[shortURL]){
    return res.send('Unauthorized to edit the long url requested!')
  }
  urlDatabase[shortURL].longURL = newURL;

  res.redirect ('/urls')
  })

//Add -take and verify the email and password and build a cookie of user_id
app.post('/login', (req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  if (!findUserByEmail(email)){
    res.status(403);
    res.send('User does not exist! Please register first!')
  };
  for (const id in users){
      const user = users[id];
    if(user.password===password){
      res.cookie('user_id',id)
      res.redirect('/urls')
    }
  }
      res.status(403);
      res.send('Wrong password!')
})

//Delete -clear a cookie and rediect the client to /urls
app.post('/logout', (req,res)=>{
  res.clearCookie('user_id');
  res.redirect ('/urls')
})

// GET /register
app.get('/register', (req, res) => {
  const templateVars = { 
    user:users[req.cookies.user_id]
   };
  res.render('register',templateVars);
});

// POST /register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email=req.body.email;
  const password =req.body.password;
  if (email.length === 0 || password.length === 0){
    res.status(400);
    res.send('No empty allowed!')
  }
  if (findUserByEmail(email)){
    res.status(400);
    res.send('This email is already registered!')
  }else{
    users[id] = {
      id,
      email,
      password
      };
    console.log(users);
    res.cookie('user_id',id);
    res.redirect('/urls');
  }
})
  
//email look up func
const findUserByEmail = (email) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return true;
    }
  }
  return false;
};

// func urlsForUser(id)
const getUrlsForUser =(id)=>{
  const urls = {};
  const keys = Object.keys(urlDatabase)
  for( const key of keys){
    const urlObj = urlDatabase[key];
    if (urlObj.userID === id){
      urls[key]=urlObj;
    }
  }
  return urls;
}

// Get login page
app.get('/login', (req, res) => {
  const templateVars = { 
    user:users[req.cookies.user_id]
   };
  res.render('login', templateVars)
})



// below are small unimportant ones
//put a hello on the / page
app.get("/", (req, res) => {
  res.send("Hello!");
});
//put a json object on the /urls.json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//put a htmled hello word on the /hello page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//the page firing function--usually comes at the bottom of the file
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});