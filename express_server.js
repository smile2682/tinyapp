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

//set the in-memory database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Read -the new url page
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["loginName"]
   };
  res.render("urls_new",templateVars);
});

//Browse -all urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["loginName"] };
  
  res.render("urls_index", templateVars);
});

//Read -a url, redirects to the single url page or post error
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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

//Add -clear a cookie and rediect the client to /urls
app.post('/logout', (req,res)=>{
  const logout = req.body.logout;
  res.clearCookie('loginName');
  res.redirect ('/urls')
})


// //
// const templateVars = {
//   username: res.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);



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