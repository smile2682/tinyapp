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

//set the in-memory database for url pairs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  res.render("urls_new",templateVars);
});

//Browse -all urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user:users[req.cookies.user_id]
  };
  
  res.render("urls_index", templateVars);
});

//Read -a url, redirects to the single url page or post error
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user:users[req.cookies.user_id]
  };
  // console.log(req.params)
  // console.log(req.params.shortURL)
if(!urlDatabase[req.params.shortURL]){
  res.send("Not a valid URL!");
}
  res.render("urls_show", templateVars);
});

//Add -use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Read -the shortURL created and redirect the client to the actuall website
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

//function to generate a random string
function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}
  
//Delete -a URL
app.post("/urls/:shortURL/delete",(req,res)=>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect ('/urls')
  })

//Edit -a URL
app.post("/urls/:shortURL",(req,res)=>{
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL]=newURL;

  res.redirect ('/urls')
  })

//Add -take the username and build a cookie
app.post('/login', (req,res)=>{
  const loginName = req.body.login;
  res.cookie('loginName',loginName);
  res.redirect ('/urls')
 
})

//Delete -clear a cookie and rediect the client to /urls
app.post('/logout', (req,res)=>{
  // const logout = req.body.logout;
  res.clearCookie('loginName');
  res.redirect ('/urls')
})

// GET /register
app.get('/register', (req, res) => {
  res.render('register');
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
  // console.log(res.cookie.user_id);
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

// Get login page
app.get('/login', (req, res) => {

  res.render('login')
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