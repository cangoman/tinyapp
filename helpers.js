/*---------------HELPER FUNCTIONS------------------*/

//If email exists in DB, returns the user object, otherwise, returns undefined
const getUserByEmail = function(emailAddress, database) {
  for (let entry in database) {
    if (emailAddress === database[entry].email)
      return database[entry];
  }
  return undefined;
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

const urlsForUser = function(id, urlDatabase) {
  const urlsForUser = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urlsForUser[url] = urlDatabase[url];
    }
  }
  return urlsForUser;
};


module.exports = {
  getUserByEmail,
  generateRandomString, 
  formatHTTP, 
  urlsForUser
}

