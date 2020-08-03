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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
} )

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new')
;});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  
});




console.log(generateRandomString());