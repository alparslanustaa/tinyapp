const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {getUserByEmail} = require('./helpers');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");


app.use(cookieSession({   name: 'session',   
keys: ["/* secret keys */"],  
  // Cookie Options   
  maxAge: 24 * 60 * 60 * 1000  
}))

//UserS 
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

//User ID database

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// function check email to user email input
const emailExists = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user].id
    }
  }
  return false;
};
//Port listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/////GET ROUTES!

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let longURL = urlDatabase[short];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {

  let shortURL = req.params.id;
  console.log('shortUrl ', urlDatabase[shortURL], shortURL)
  let longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: shortURL,
    longURL: longURL,
  };
  res.render("urls_show", templateVars);
});

//////POST ROUTES!

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let url = generateRandomString();
  let result = req.body.longURL;
  urlDatabase[url] = {
    longURL: result,
    userID: req.session.user_id
  };
  console.log(urlDatabase)
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
 
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are not authorized for this action')
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post('/urls/:shortURL/edit', (req, res) => {

  
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are not authorized for this action')

  }
  urlDatabase[shortURL].longURL = req.body.longURL
  res.redirect(`/urls`);
});


app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls/");
});

//LOGIN PAGE ERRORS & FUNCTION USED & PASSWORD HASSING
app.post("/login", (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;
  if (emailExists(email) === false) {
    return res.status(403).send("Email was not found in the data base!!!")
  }
  const userId = emailExists(email);

  console.log("getone", bcrypt.hashSync(password, 10), users[userId].password)

  if (!bcrypt.compareSync(password, users[userId].password)) {
    return res.status(403).send("Password was not found in the data base!!!")
  }
  req.session.user_id = userId;
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls')
});

// REGISTER PAGE & HASSING THE PASS
app.post("/register", (req, res) => {
  console.log(req.body)
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    return res.status(400).send("email can't be empty!");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("user is already in the system, go to login.");
  }
  users[user.id] = user
  req.session.user_id = user.id;
  res.redirect("/urls")

});

//URLS DATABASE FOUNCTION TO COMPARE ID TO DATABASE ID
function urlsForUser(userID) {
  const loggedInUserUrl = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      loggedInUserUrl[url] = urlDatabase[url];
    }
  }
  return loggedInUserUrl;
}

//GENERATING RANDOM CHAR
function generateRandomString() {
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}