//grabing and setting all the needed dependencies
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'Aug',
  keys: ['QksUi837Syd', 'key2', 'more stuffs']
}));
const morgan = require('morgan')
app.use(morgan('dev'))
const bcrypt = require('bcrypt');
const { findUserByEmail, generateRandomString, getUrlsForUser, urlDatabase, users } = require('./helper')



//GETS:
// Get login page
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  if (userID) {
    return res.redirect('/urls');
  }
  res.render('login', templateVars)
})

//Get '/' page
app.get("/", (req, res) => {
  const user = users[req.session.user_id]
  if (user) {
    return res.redirect('/urls')
  };
  res.redirect('/login')
});

// GET /register
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID]
  };
  if (userID) {
    return res.redirect('/urls');
  }
  res.render('register', templateVars);
});

//Get - a json object on the /urls.json page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Get a htmled hello word on the /hello page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Get/Read -the new url page
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id]
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (user) {
    return res.render("urls_new", templateVars);
  };
  res.redirect('/login')
});

//Get/Browse -all urls
app.get("/urls", (req, res) => {
  const singleUserDb = getUrlsForUser(req.session.user_id);
  const user = users[req.session.user_id]
  const templateVars = {
    urls: singleUserDb,
    user: users[req.session.user_id]
  }
  if (user) {
    console.log(singleUserDb)
    return res.render("urls_index", templateVars);
  };
  res.send("<h1>Please <a href='/login'>login</a> first!<h1/>")
});

//Get/Read -a url, redirects to the single url page or post error
app.get("/urls/:shortURL", (req, res) => {
  const singleUserDb = getUrlsForUser(req.session.user_id);
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("<h1>Please <a href='/login'>login first!</a></h1>")
  }
  if (!singleUserDb[shortURL]) {
    if (urlDatabase[shortURL]) {
      return res.send("<h1> Unauthorized to see the short url requested! <a href='/urls'>BACK</a></h1>")
    }
  };
  if (!urlDatabase[shortURL]) {
    return res.send("<h1>Not a valid URL!<a href='/urls'>BACK</a></h1>");
  }
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//Get/Read -the shortURL created and redirect the client to the actuall website
//everyone should be able to see! that is the basic function of this app!
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const databaseUrl = urlDatabase[shortURL];
  if (!databaseUrl) {
    return res.send('The requested short URL does not exist!')
  }
  return res.redirect(databaseUrl.longURL);
});

//POSTS:
//Post/Add -use the long url client provided to create a short url, add it to the database and show it in the redirected single url page.
app.post("/urls", (req, res) => {
  //define all variables here:
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const longURL = req.body.longUrl;
//if the user is not logged in:
  if(!userID){
    return res.status(400).send ("<h1>Please <a href='/login'>login first!</a></h1>")
  }
  //if logged in, return the newly generated url in /urls
  urlDatabase[shortURL] = {
    longURL,
    userID
  }
  
  res.redirect(`/urls/${shortURL}`);
});

//Delete -a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const singleUserDb = getUrlsForUser(req.session.user_id);
  const shortURL = req.params.shortURL;

  if (!singleUserDb[shortURL]) {
    return res.send("<h1> Unauthorized to delete the long url requested! <a href='/urls'>BACK</a></h1>")
  }
  delete urlDatabase[shortURL];

  res.redirect('/urls')
})

//Post/Edit -a URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const singleUserDb = getUrlsForUser(req.session.user_id);
  const newURL = req.body.newURL;
  if (!singleUserDb[shortURL]) {
    return res.send("<h1> Unauthorized to edit the long url requested! <a href='/urls'>BACK</a></h1>")
  }
  urlDatabase[shortURL].longURL = newURL;

  res.redirect('/urls')
})

//Post/Add -take and verify the email and password and build a cookie of user_id
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!findUserByEmail(email, users)) {
    return res.status(403).send("<h1>User does not exist! Please <a href='/register'>register</a> first!</h1>")
  };
  for (const id in users) {
    const user = users[id];
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect('/urls')
    }
  }
  res.status(403);
  res.send("<h1>Wrong password!Please <a href='/login'>try again!</a>!</h1>")
})

//Delete -clear a cookie and rediect the client to /urls
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
})

// POST /register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send("<h1>Missing email or password. Please <a href='/register'>try again</a></h1>")
  }
  if (findUserByEmail(email, users)) {
    return res.status(400).send("<h1>This email is already registered!Please <a href='/login'>login</a></h1>")
  }
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  console.log(users);
  req.session.user_id = users[id].id;
  console.log("req.session:", req.session.user_id)
  res.redirect('/urls');

})


//the page firing function--usually comes at the bottom of the file
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});