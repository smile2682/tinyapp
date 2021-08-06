//set the in-memory database for url pairs
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "2nVx2b"
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

//email look up func
const findUserByEmail = function (email, database) {
  for (const id in database) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  };
};

console.log(findUserByEmail("user@example.com", users))

//function to generate a random string
function generateRandomString() {
  const shortURL = Math.random().toString(36).substr(2, 6);
  return shortURL;
}

// func urlsForUser(id)
const getUrlsForUser = (id) => {
  const urls = {};
  const keys = Object.keys(urlDatabase)
  for (const key of keys) {
    const urlObj = urlDatabase[key];
    if (urlObj.userID === id) {
      urls[key] = urlObj;
    }
  }
  return urls;
}

module.exports = {findUserByEmail, generateRandomString, getUrlsForUser,urlDatabase, users}