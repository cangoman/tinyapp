//Import express, define my constants
const express = require('express');
const app = express();
const PORT = 8080; // default port
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// request handlers
app.get("/", (req, res) => { //unnecessary
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
} )

app.get('/urls.json', (req, res) => { // unnecessary?
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new')
;});



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

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
  //console.log(req.params);
  res.redirect('/urls');
});

//Deletes a URL from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  
});

