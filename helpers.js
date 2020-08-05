/*---------------HELPER FUNCTIONS------------------*/

//If email exists in DB, returns the user object, otherwise, returns undefined
const getUserByEmail = function(emailAddress, database) {
  for (let entry in database) {
    if (emailAddress === database[entry].email)
      return database[entry];
  }
  return undefined;
};





module.exports = {
  getUserByEmail
}

