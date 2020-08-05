/*------------------IMPORTS---------------------*/

const express = require('express');
const app = express();
const PORT = 8080; // default port
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


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

//fx to check if email already exists
//We could omit passing the database as an argument, cause we are using a global variable
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
app.get("/", (req, res) => { //unnecessary
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userURL = urlsForUser(req.cookies["user_id"]);
  let templateVars = {urls: userURL, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get('/urls.json', (req, res) => { // unnecessary?
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/urls');
  } else {
    let templateVars = {user: users[req.cookies["user_id"]]}
    res.render('urls_new', templateVars);
  }
;});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => { 
  const longURL = urlDatabase[req.params["shortURL"]].longURL;
  res.redirect(longURL);
});

app.get("/register", (req,res) => {
  let templateVars = {user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]}
  res.render('login', templateVars);
});


/*---------------POST REQUESTS------------------*/

//Adds a URL to the database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = formatHTTP(req.body.longURL);
  res.redirect(302, `/urls/${shortURL}`)
});

//Edits an existing URL in the database
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);
  if (req.cookies["user_id"] === urlDatabase[id].userID) {
    const newURL = req.body.longURL;
    urlDatabase[id].longURL = formatHTTP(newURL);  
  }
  res.redirect('/urls');
});

//Deletes a URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[id].userID){
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//login form handler, also creates a cookie
app.post('/login', (req, res) => {  // 
  const id = emailMatch(req.body.email, users);
  if (!id || ( !bcrypt.compareSync(req.body.password,users[id].password)) ) {
    res.sendStatus(403);
  } else {
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});

//logout form request handler, clears cookie
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Get registration info, UN and hashed PW, store it in DB and store email as cookie
app.post('/register', (req, res) => {
  if (emailMatch(req.body.email, users) || !req.body.password) {
    res.sendStatus(400);
  } else {
    const newID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[newID] = { id: newID, email: req.body.email, password: hashedPassword };
    res.cookie("user_id", newID);
    res.redirect('/urls');
  }
});


// Run our server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});



