/*---------------CONSTANTS AND IMPORTS------------------*/

//Import express, define my constants

const express = require('express');
const app = express();
const PORT = 8080; // default port
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


/*---------------HELPER FUNCTIONS------------------*/

//fx to check if email already exists
const emailMatch = function(emailAddress, database) {
  for (let entry in database) {
    if (emailAddress === database[entry].email)
      return entry;
  }
  return false;
};

//Use to generate user IDs and tinyURLs
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID" : {
    id: "userRandomID",
    email: "user@example.com",
    password: "supersecurepw1234"
  }
};


/*--------------REQUEST HANDLERS-----------------*/

// GET REQUESTS
app.get("/", (req, res) => { //unnecessary
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
} )

app.get('/urls.json', (req, res) => { // unnecessary?
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]}
  res.render('urls_new', templateVars);
;});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(req.params.shortURL);
  res.redirect(longURL);
});

app.get("/register", (req,res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render('login', templateVars);
})


/*---------------POST REQUESTS------------------*/

//Adds a URL to the database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302, `/urls/${shortURL}`)
});

//Edits an existing URL in the database
app.post('/urls/:id', (req, res) => {
  const newURL = req.body.longURL;
  urlDatabase[req.params.id] = newURL;
  res.redirect('/urls');
});

//Deletes a URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//login form handler, also creates a cookie
app.post('/login', (req, res) => {  // 
  const id = emailMatch(req.body.email, users);
  if (!id || (req.body.password !== users[id].password))
    res.sendStatus(403);
  
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//logout form request handler, clears cookie
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Get registration info, UN and PW, store it in DB and as cookie
app.post('/register', (req, res) => {
  if (emailMatch(req.body.email, users) || !req.body.password) {
    res.sendStatus(400);
  } else {
    const newID = generateRandomString();
    users[newID] = req.body;
    users[newID].id = newID;
    res.cookie("user_id", newID);
    res.redirect('/urls')
  }
});


// Run our server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});



