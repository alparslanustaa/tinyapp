const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const cookieSession = require("cookie-session");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  cookieSession({
    name: "session",
    secret: "dwajdjgjwajdwajawj",
    maxAge: 24 * 60 * 60 * 1000,
  })
);

//user ID database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//user IDs emails and passwords
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },

  hi: {
    id: "hi",
    email: "hi@hi.com",
    password: "hi",
  },
};

//  root home page redirect to login
app.get("/", (req, res) => {
  res.send('HI there!');
});

// URLS pages
app.get("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.status(403).send("user must be logged in to view urls");
  } else {
    const user = req.session["user_id"];
    const templateVars = {
      user,
      urls: urlsForUser(req.session["user_id"], urlDatabase),
      user: users[req.session["user_id"]],
    };
    console.log(templateVars);
    res.render("urls_index", templateVars);

  }
});

// Registration page get request
app.get("/register", (req, res) => {
  if (!users[req.session["user_id"]]) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// new user redirecting Login
app.get("/urls/new", (req, res) => {
  console.log(req.session)
  if (!users[req.session["user_id"]]) {
    return res.status(403).redirect("/login");
  }
  let templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

// Long URL redirect
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  if (!urlDatabase[short]) {
    res.status(404).send(" url does not exist");
  } else {
    let longURL = urlDatabase[short].longURL;
    res.redirect(longURL);
  }
});

// Login page get requests
app.get("/login", (req, res) => {
  if (!users[req.session["user_id"]]) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//IDs
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("url does not exist");
  }
  if (req.session["user_id"] !== urlDatabase[shortURL]["userID"]) {
    return res.status(403).send("user can only see their own urls");
  }
  let longURL = urlDatabase[shortURL]["longURL"];
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// POSTS
// create the shortURL and redirects to the new link
app.post("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.status(400).send("must be logged in");
  } else {

    let url = generateRandomString();
    let result = req.body.longURL;
    urlDatabase[url] = {
      longURL: result,
      shortURL: url,
      userID: req.session["user_id"],
    };
    res.redirect(`/urls/${url}`);
  }
});

app.post("/urls/:id", (req, res) => {
  const user = req.session["user_id"];
  if (user === urlDatabase[req.params.id].userID) {
    const longURL = req.body.longURL;
    urlDatabase[req.params.id]["longURL"] = longURL;
    res.redirect("/urls/");
  } else {
    res.status(400).send("forbidden access");
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("fields cannot be empty when registering");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("user is already in the system, go to login.");
  } else {
    let hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id: id,
      email: email,
      password: hashedPassword,
    };

    req.session["user_id"] = id;
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  let id = req.session["user_id"];
  if (id === urlDatabase[short].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.status(403).send("Do not have permissions to delete this");
  }
});
// Login cr. check && cyrpt
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (email === "" && password === "") {
    res.status(404).send("both fields must be filled in");
  }
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session["user_id"] = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Failed login, please enter correct credentials");
    }
  } else {
    res.status(404).send("User does not exist, create a user.");
  }
});

// Clear user_id cookie
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});