/*------------------IMPORTS---------------------*/

const express = require('express');
const app = express();
const PORT = 8080; // default port
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['randomStringyBop', 'also quite random stuff']
}));


/*----------DATABASE-FUNCTIONING OBJECTS----------*/
/*----------------global variables----------------*/

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "aJ48lW" }
};

const users = {
  aJ48lW : {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", 10)
  }
};

/*---------------HELPER FUNCTIONS------------------*/


//We could omit passing the database as an argument, cause we are using a global variable


//Use to generate user IDs and tinyURLs
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

const formatHTTP = function(address) {
  if (!address.match(/^http/))
    address = `http://${address}`;
  return address;
};

const urlsForUser = function(id) {
  const urlsForUser = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urlsForUser[url] = urlDatabase[url];
    }
  }
  return urlsForUser;
};


/*--------------REQUEST HANDLERS-----------------*/

// GET REQUESTS
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls", (req, res) => {
  const userURL = urlsForUser(req.session.user_id);
  let templateVars = {urls: userURL, user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

// app.get('/urls.json', (req, res) => { // unnecessary?
//   res.json(urlDatabase);
// });

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {user: users[req.session.user_id]};
    res.render('urls_new', templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).redirect('/login');
  } else {
    const url = urlDatabase[req.params.id];
    if (!url || url.userID !== req.session.user_id) {
      const errorMessage = "The URL requested does not exist, or you don't have the appropriate permissions"
      let templateVars = {shortURL: req.params.id, error: errorMessage, user: users[req.session.user_id]};
      res.render('error', templateVars);
    } else {
      let templateVars = {shortURL: req.params.id, longURL: url.longURL, user: users[req.session.user_id] };
      res.render('urls_show', templateVars);
    }
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = (urlDatabase[req.params["id"]]) ? urlDatabase[req.params["id"]].longURL : null;
  if (longURL) {
    res.redirect(longURL);
  } else {
    const errorMessage = "The requested URL does not exist";
    let templateVars = {shortURL: req.params.id, error: errorMessage, user: users[req.session.user_id]};
    res.render('error', templateVars);
  }
});

app.get("/register", (req,res) => {
  if (!req.session.user_id) {
    let templateVars = {user: users[req.session.user_id] };
    res.render("register", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {user: users[req.session.user_id]};
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
});


/*---------------POST REQUESTS------------------*/

//Adds a URL to the database
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: formatHTTP(req.body.longURL), userID: user };
    res.redirect(302, `/urls/${shortURL}`);
  } else {
    res.redirect('/urls');
  }
});

//Edits an existing URL in the database
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  if (req.session["user_id"] === urlDatabase[id].userID) {
    const newURL = req.body.longURL;
    urlDatabase[id].longURL = formatHTTP(newURL);
  }
  res.redirect('/urls');
});

//Deletes a URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.params.shortURL;
  if (req.session.user_id === urlDatabase[id].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//login form handler, also creates a cookie
app.post('/login', (req, res) => {  //
  
  const user = getUserByEmail(req.body.email, users);
  if (!user || (!bcrypt.compareSync(req.body.password, user.password))) {
    res.sendStatus(403);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

//logout form request handler, clears cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Get registration info, UN and hashed PW, store it in DB and store email as cookie
app.post('/register', (req, res) => {
  if (getUserByEmail(req.body.email, users) || !req.body.password) {
    res.sendStatus(400);
  } else {
    const newID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[newID] = { id: newID, email: req.body.email, password: hashedPassword };
    req.session.user_id = newID;
    res.redirect('/urls');
  }
});


// Run our server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});



