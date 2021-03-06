/*------------------IMPORTS---------------------*/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString, formatHTTP, urlsForUser} = require('./helpers');
const PORT = 8080; // default port

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['randomStringyBop', 'also quite random stuff']
}));
app.use(methodOverride('_method'));

/*----------DATABASE-FUNCTIONING OBJECTS----------*/
/*------global variables: for debugging, comment out to start clean------*/
const date1 = Date.now();
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW", visits: [], visitors: [], created: date1 },
  "9sm5xK": {longURL: "http://www.google.com", userID: "aJ48lW", visits: [], visitors: [], created: date1 }
};

const users = {
  aJ48lW : {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", 10)
  }
};


/*--------------REQUEST HANDLERS-----------------*/


/*----- GET REQUESTS-----*/
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls", (req, res) => {
  const userURL = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = {urls: userURL, user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

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
      const errorMessage = "The URL requested does not exist, or you don't have the appropriate permissions";
      let templateVars = {shortURL: req.params.id, error: errorMessage, user: users[req.session.user_id]};
      res.render('error', templateVars);
    } else {
      let templateVars = {url: urlDatabase[req.params.id], shortURL: req.params.id, longURL: url.longURL, user: users[req.session.user_id] };
      res.render('urls_show', templateVars);
    }
  }
});

//Redirection to the long (actual) URL
//Keeps track of visitor_ids and timestamps visits
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = (urlDatabase[id]) ? urlDatabase[id].longURL : null;
  
  // longURL is valid
  if (longURL) {
    //Check for existing visitor cookie, create one if it doesnt exist
    if (!req.session.visitor_id) {
      req.session.visitor_id = generateRandomString();
    }

    //check if user has visited URL before, if not, add to the visitor property
    if (!urlDatabase[id].visitors.includes(req.session.visitor_id)) {
      urlDatabase[id].visitors.push(req.session.visitor_id);
    }

    //timestamp visit and add to database
    const date = new Date();
    const visit = {visitor: req.session.visitor_id, date: date.toString()};
    urlDatabase[id].visits.push(visit);
    res.redirect(longURL);
  } else {
    const errorMessage = "The requested URL does not exist";
    let templateVars = {shortURL: req.params.id, error: errorMessage, user: users[req.session.user_id]};
    res.render('error', templateVars);
  }
});

app.get("/register", (req,res) => {
  if (!req.session.user_id) {
    let templateVars = {user: users[req.session.user_id], error: "" };
    res.render("register", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  if (!req.session.user_id) {
    let templateVars = {user: users[req.session.user_id], error: ""};
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
    const date = Date.now();
    urlDatabase[shortURL] = { longURL: formatHTTP(req.body.longURL), visits: [], visitors: [], userID: user, created: date };
    res.redirect(302, `/urls/${shortURL}`);
  } else {
    res.redirect('/urls');
  }
});

//login form handler, also creates a cookie
app.post('/login', (req, res) => {  //
  const user = getUserByEmail(req.body.email, users);
  if (!user || (!bcrypt.compareSync(req.body.password, user.password))) {
    const errorMessage = "Invalid email/username combination";
    let templateVars = {error : errorMessage, user: "" };
    res.render('login', templateVars);
  } else {
    req.session.user_id = user.id;
    res.redirect('urls');
  }
});

//logout form request handler, clears cookie
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

//Get registration info, UN and hashed PW, store it in DB and store email as cookie
app.post('/register', (req, res) => {
  let errorMessage;
  if (getUserByEmail(req.body.email, users)) {
    errorMessage = "Email address is already in use. Please try again with a different one";
    let templateVars = {error : errorMessage, user: "" };
    res.render('register', templateVars);
  } else if (!req.body.password) {
    errorMessage = "Password field cannot be empty";
    let templateVars = {error : errorMessage, user: "" };
    res.render('register', templateVars);
  } else {
    const newID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[newID] = { id: newID, email: req.body.email, password: hashedPassword };
    req.session.user_id = newID;
    res.redirect('/urls');
  }
});

/*----------------PUT REQUESTS------------------*/

//Edits an existing URL in the database
app.put('/urls/:id', (req, res) => {
  const id = req.params.id;
  if (req.session["user_id"] === urlDatabase[id].userID) {
    const newURL = req.body.longURL;
    urlDatabase[id].longURL = formatHTTP(newURL);
    res.redirect('/urls');
  } else {
    const errorMessage = "You don't have the permissions to edit this URL!";
    let templateVars = {user: "", error: errorMessage};
    res.render('error', templateVars);
  }
});

/*----------------DELETE REQUESTS------------------*/

//Deletes a URL from the database
app.delete('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) {
    const errorMessage = "You are not logged in!";
    let templateVars = {user: "", error: errorMessage};
    res.render('error', templateVars);
  } else {
    const id = req.params.shortURL;
    if (urlDatabase[id] && req.session.user_id === urlDatabase[id].userID) {
      delete urlDatabase[id];
      res.redirect("/urls");
    } else {
      const errorMessage = "You don't have the permissions to delete this URL!";
      let templateVars = {user: "", error: errorMessage};
      res.render('error', templateVars);
    }
    
  }
});


// Run our server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});



